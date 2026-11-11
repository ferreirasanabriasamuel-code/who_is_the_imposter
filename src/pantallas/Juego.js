/* ============================================================
   Juego.js · port de juego.html + js/juego.js + js/tiempo.js
   Debate con cronómetro (anillo SVG con progreso, presets de
   1/2/3/5 minutos, modo SIN LÍMITE que cuenta hacia arriba,
   pausa/reanudación y modo urgente en los últimos 10 segundos),
   revelación final y nuevo juego.
   ============================================================ */

import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle as CircSvg, G } from "react-native-svg";
import { Animar, Btn, Chip, Header, Marca, Pie, Tarjeta, TituloSeccion, TxtBtn } from "../componentes";
import { useTema } from "../tema";
import { F } from "../fuentes";
import { IconoDebate, IconoPausa, IconoPlay, IconoTimer } from "../iconos";
import { azar } from "../partida";

const RADIO = 88;
const C = 2 * Math.PI * RADIO; // circunferencia del anillo
const PRESETS = [
  { min: 1, etiqueta: "1 min" },
  { min: 2, etiqueta: "2 min" },
  { min: 3, etiqueta: "3 min" },
  { min: 5, etiqueta: "5 min" },
  { min: 0, etiqueta: "∞ Sin límite" },
];

function fmt(seg) {
  seg = Math.max(0, Math.round(seg));
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

/* ---------- Cronómetro de debate (tiempo.js) ---------- */
function Cronometro() {
  const { colores } = useTema();
  const t = useRef({ total: 180, restante: 180, transcurrido: 0, inicioTs: 0, corriendo: false, estado: "" });
  const [, forzar] = useReducer((x) => x + 1, 0);
  const intervalo = useRef(null);

  const urgenteOp = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const { total, restante, transcurrido, corriendo } = t.current;
  const sinLimite = total === 0;

  function detener() {
    clearInterval(intervalo.current);
    intervalo.current = null;
    t.current.corriendo = false;
    forzar();
  }

  function gasto() {
    if (t.current.total === 0) {
      t.current.transcurrido = (Date.now() - t.current.inicioTs) / 1000;
      forzar();
      return;
    }
    const r = (t.current.inicioTs - Date.now()) / 1000;
    if (r <= 0) {
      t.current.restante = 0;
      detener();
      t.current.estado = "¡Tiempo! Voten ya.";
      forzar();
      Animated.sequence([
        Animated.timing(shake, { toValue: -6, duration: 110, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 110, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -4, duration: 80, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 4, duration: 80, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
      ]).start();
      return;
    }
    t.current.restante = r;
    forzar();
  }

  function iniciar() {
    if (t.current.corriendo) {
      // pausa
      detener();
      t.current.estado = "En pausa";
      forzar();
      return;
    }
    if (t.current.total === 0) {
      t.current.inicioTs = Date.now() - t.current.transcurrido * 1000; // reanuda donde quedó
    } else {
      if (t.current.restante <= 0) t.current.restante = t.current.total;
      t.current.inicioTs = Date.now() + t.current.restante * 1000;
    }
    t.current.corriendo = true;
    t.current.estado = "";
    forzar();
    clearInterval(intervalo.current);
    intervalo.current = setInterval(gasto, 200);
    gasto();
  }

  function resetear() {
    detener();
    t.current.restante = t.current.total;
    t.current.transcurrido = 0;
    t.current.estado = "";
    forzar();
  }

  function elegirPreset(min) {
    t.current.total = min * 60;
    resetear();
  }

  // Limpieza del intervalo al desmontar
  useEffect(() => () => clearInterval(intervalo.current), []);

  // Latido del número urgente (últimos 10 segundos corriendo)
  const urgente = corriendo && !sinLimite && restante <= 10 && restante > 0;
  useEffect(() => {
    if (urgente) {
      const lat = Animated.loop(
        Animated.sequence([
          Animated.timing(urgenteOp, { toValue: 1.07, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(urgenteOp, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      lat.start();
      return () => lat.stop();
    }
    urgenteOp.setValue(1);
  }, [urgente, urgenteOp]);

  const agotado = !corriendo && total > 0 && restante <= 0;
  const progColor = urgente || agotado ? colores.err : "#ffd500";
  const k = total ? restante / total : 0;
  const offset = sinLimite ? 0 : C * (1 - k);

  return (
    <Tarjeta style={styles.panelTimer}>
      <TituloSeccion icono={<IconoTimer tam={18} color={colores.iconoSeccion} />}>
        Cronómetro de debate
      </TituloSeccion>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Chip key={p.min} activa={total === p.min * 60} onPress={() => elegirPreset(p.min)}>
            {p.etiqueta}
          </Chip>
        ))}
      </View>
      <Animated.View
        style={[
          styles.circulo,
          { backgroundColor: colores.card2, transform: [{ translateX: shake }] },
        ]}
      >
        <View style={StyleSheet.absoluteFill}>
          <CirculoAnillo fondo={colores.line} prog={progColor} offset={offset} />
        </View>
        <Animated.View style={[styles.nucleo, { transform: [{ scale: urgente ? urgenteOp : 1 }] }]}>
          <Text style={[styles.timerNum, { color: urgente ? colores.err : colores.ink }]}>
            {sinLimite ? fmt(transcurrido) : fmt(restante)}
          </Text>
          <Text style={[styles.timerEstado, { color: colores.mut }]}>
            {t.current.estado || " "}
          </Text>
        </Animated.View>
      </Animated.View>
      <View style={styles.acciones}>
        <Btn onPress={iniciar}>
          {corriendo ? (
            <IconoPausa tam={16} color={colores.ink} />
          ) : (
            <IconoPlay tam={16} color={colores.ink} />
          )}
          <TxtBtn color={colores.ink}>{corriendo ? "Pausar" : "Iniciar"}</TxtBtn>
        </Btn>
        <Btn onPress={resetear}>
          <TxtBtn color={colores.ink}>Reiniciar</TxtBtn>
        </Btn>
      </View>
    </Tarjeta>
  );
}

/* Anillo SVG: fondo + progreso girado -90° para que empiece arriba */
function CirculoAnillo({ fondo, prog, offset }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 200">
      <CircSvg cx={100} cy={100} r={RADIO} stroke={fondo} strokeWidth={9} fill="none" />
      <G transform="rotate(-90 100 100)">
        <CircSvg
          cx={100}
          cy={100}
          r={RADIO}
          stroke={prog}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </G>
    </Svg>
  );
}

/* ---------- Pantalla de juego ---------- */
export default function Juego({ partida, onNuevoJuego }) {
  const { colores } = useTema();
  const [revelado, setRevelado] = useReducer(() => true, false);

  // Quien arranca la conversación se elige al azar, no siempre es el primero
  const quienEmpieza = useMemo(() => azar(partida.jugadores), [partida.jugadores]);

  return (
    <View style={{ flex: 1, backgroundColor: colores.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenedor}>
        <Header />

        <View style={styles.escenario}>
          {/* DEBATE */}
          <Animar>
            <Tarjeta>
              <TituloSeccion icono={<IconoDebate tam={18} color={colores.iconoSeccion} />}>
                Debate
              </TituloSeccion>
              <Text style={[styles.arranque, { color: colores.ink }]}>
                Empieza: <Marca>{quienEmpieza}</Marca>
              </Text>
            </Tarjeta>
          </Animar>

          {/* CRONÓMETRO DE DEBATE */}
          <Animar delay={60}>
            <Cronometro />
          </Animar>

          {/* REVELAR */}
          <Animar delay={120} style={styles.ctasCentradas}>
            {!revelado && (
              <Btn primaria grande onPress={setRevelado}>
                <TxtBtn grande color={colores.textoBtnPrimario}>Revelar impostor y palabra</TxtBtn>
              </Btn>
            )}
          </Animar>

          {revelado && (
            <>
              <Animar delay={0}>
                <Tarjeta style={styles.panelRevela}>
                  <Text style={[styles.etiquetaRevela, { color: colores.mut }]}>Impostor(es)</Text>
                  <Text style={[styles.palabraGrande, { color: colores.err }]}>
                    {partida.todosImpostores
                      ? "¡Todos! (" + partida.jugadores.join(", ") + ")"
                      : partida.impostores.map((i) => partida.jugadores[i]).join(", ")}
                  </Text>
                  <Text style={[styles.etiquetaRevela, { color: colores.mut }]}>Palabra</Text>
                  <Text style={[styles.palabraGrande, { color: colores.ink }]}>
                    {partida.todosImpostores ? "¡Nadie la conocía!" : partida.palabra}
                  </Text>
                </Tarjeta>
              </Animar>
              <Animar delay={0} style={styles.zonaNuevo}>
                <Btn grande onPress={onNuevoJuego}>
                  <TxtBtn grande color={colores.ink}>Nuevo juego</TxtBtn>
                </Btn>
              </Animar>
            </>
          )}
        </View>

        <Pie />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { paddingBottom: 24 },
  escenario: { maxWidth: 560, width: "100%", alignSelf: "center" },
  arranque: { fontSize: 16 },
  panelTimer: { marginTop: 14 },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 6,
  },
  circulo: {
    width: 230,
    height: 230,
    marginVertical: 10,
    alignSelf: "center",
    borderRadius: 115,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  nucleo: { alignItems: "center", gap: 2 },
  timerNum: {
    fontFamily: F.displayFuerte,
    fontSize: 40,
    letterSpacing: -0.8,
    lineHeight: 42,
    fontVariant: ["tabular-nums"],
  },
  timerEstado: { fontSize: 14, fontFamily: F.medio, minHeight: 19 },
  acciones: { flexDirection: "row", gap: 8, justifyContent: "center" },
  ctasCentradas: { alignItems: "center", marginTop: 12 },
  panelRevela: { marginTop: 20 },
  etiquetaRevela: {
    fontSize: 12.5,
    fontFamily: F.fuerza,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 4,
  },
  palabraGrande: {
    fontFamily: F.displayFuerte,
    fontSize: 28,
    letterSpacing: -0.8,
    marginVertical: 8,
  },
  zonaNuevo: { alignItems: "center", marginTop: 26, marginBottom: 12 },
});
