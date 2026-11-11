/* ============================================================
   Reparto.js · port de reparto.html + js/reparto.js
   Cada jugador mantiene presionada la carta para ver su papel.
   Presionar = la carta gira y muestra el secreto; soltar = gira de vuelta.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Btn, Header, Pie, TxtBtn, usePop } from "../componentes";
import { useTema } from "../tema";
import { F } from "../fuentes";
import { IconoFlecha } from "../iconos";

export default function Reparto({ partida, onSiguiente, onTerminar }) {
  const { colores } = useTema();
  const giro = useRef(new Animated.Value(0)).current;
  const [vista, setVista] = useState(false);
  const pop = usePop();

  const i = partida.turno;
  const esUltimo = i === partida.jugadores.length - 1;
  const esImpostor = partida.impostores.includes(i);

  // Mantener presionado el botón debe "ver"; los primeros 150 ms no se ve nada
  // para imitar el arranque del giro (transición .55s del CSS).
  function ver() {
    setVista(true);
    Animated.spring(giro, {
      toValue: 180,
      friction: 6.5,
      tension: 90,
      useNativeDriver: true,
    }).start();
    pop.animar();
  }

  function tapar() {
    setVista(false);
    Animated.spring(giro, {
      toValue: 0,
      friction: 6.5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }

  function siguiente() {
    tapar();
    const nueva = { ...partida, turno: partida.turno + 1 };
    if (nueva.turno >= partida.jugadores.length) {
      // Todos vieron su carta: a hablar; la revelación queda en la pantalla de juego
      onTerminar(nueva);
    } else {
      onSiguiente(nueva);
    }
  }

  // Si se avanza de jugador, la carta ya está tapada (estado nuevo)
  useEffect(() => {
    setVista(false);
    giro.setValue(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partida.turno]);

  const frenteRotacion = giro.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const dorsoRotacion = giro.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });
  const frenteOpacidad = giro.interpolate({ inputRange: [0, 89, 90, 180], outputRange: [1, 1, 0, 0] });
  const dorsoOpacidad = giro.interpolate({ inputRange: [0, 89, 90, 180], outputRange: [0, 0, 1, 1] });

  return (
    <View style={{ flex: 1, backgroundColor: colores.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenedor}
      >
        <Header />

        <View style={styles.escenario}>
          <Text style={[styles.progreso, { color: colores.mut }]}>
            {"Jugador " + (i + 1) + " de " + partida.jugadores.length}
          </Text>

          <View style={styles.zonaCarta}>
            <Pressable onPressIn={ver} onPressOut={tapar} accessibilityLabel="Mantén presionada la carta para ver tu papel; al soltar se voltea de nuevo">
              <View style={[styles.carta, { borderColor: colores.line, backgroundColor: colores.card }]}>
                {/* Cara frontal: nombre del turno */}
                <Animated.View
                  style={[
                    styles.cara,
                    { backgroundColor: colores.card, borderColor: colores.line, opacity: frenteOpacidad, transform: [{ perspective: 1500 }, { rotateY: frenteRotacion }] },
                  ]}
                  pointerEvents="none"
                >
                  <Text style={[styles.turnoNombre, { color: colores.ink }]}>{partida.jugadores[i]}</Text>
                  <Text style={[styles.toca, { color: colores.brand }]}>Mantén presionada la carta</Text>
                </Animated.View>

                {/* Dorso: el secreto */}
                <Animated.View
                  style={[
                    styles.cara,
                    styles.dorso,
                    { backgroundColor: colores.card, borderColor: colores.line, opacity: dorsoOpacidad, transform: [{ perspective: 1500 }, { rotateY: dorsoRotacion }] },
                  ]}
                  pointerEvents="none"
                >
                  {vista && (
                    <Animated.View style={[styles.centroDorso, { opacity: pop.op, transform: [{ scale: pop.esc }] }]}>
                      {esImpostor ? (
                        <>
                          <Text style={[styles.palabraGrande, { color: colores.err }]}>IMPOSTOR</Text>
                          {partida.mostrarPista && partida.pista ? (
                            <Text style={[styles.pista, { color: colores.brand }]}>Pista: {partida.pista}</Text>
                          ) : null}
                        </>
                      ) : (
                        <Text style={[styles.palabraGrande, { color: colores.ink }]}>{partida.palabra}</Text>
                      )}
                    </Animated.View>
                  )}
                </Animated.View>
              </View>
            </Pressable>
          </View>

          <View style={styles.ctasCentradas}>
            <Btn primaria grande onPress={siguiente}>
              <TxtBtn grande color={colores.textoBtnPrimario}>
                {esUltimo ? "Terminar reparto " : "Siguiente jugador"}
              </TxtBtn>
              {esUltimo && <IconoFlecha tam={16} color={colores.textoBtnPrimario} />}
            </Btn>
          </View>
        </View>

        <Pie />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { paddingBottom: 24 },
  escenario: { maxWidth: 560, width: "100%", alignSelf: "center", alignItems: "center" },
  progreso: { fontSize: 14, marginBottom: 14 },
  zonaCarta: { maxWidth: 360, width: "88%", marginBottom: 20 },
  carta: { width: "100%", aspectRatio: 5 / 6 },
  cara: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
    overflow: "hidden",
  },
  dorso: { transform: [{ rotateY: "180deg" }] },
  centroDorso: { alignItems: "center" },
  turnoNombre: {
    fontFamily: F.displayFuerte,
    fontSize: 27,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  toca: { marginTop: 22, fontFamily: F.fuerza, fontSize: 15 },
  palabraGrande: {
    fontFamily: F.displayFuerte,
    fontSize: 28,
    letterSpacing: -0.8,
    marginVertical: 12,
    textAlign: "center",
  },
  pista: { fontFamily: F.medio, fontSize: 15, marginBottom: 6, textAlign: "center" },
  ctasCentradas: { width: "88%", maxWidth: 360, alignItems: "center" },
});
