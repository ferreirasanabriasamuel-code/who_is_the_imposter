/* ============================================================
   Inicio.js · port de index.html + js/ajustes.js + js/reglas.js
   Hero, ajustes de jugadores/impostores/categorías/extras,
   sheets «Cómo se juega» y «Querido usuario», FAB y footer.
   ============================================================ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CATEGORIAS as CATEGORIAS_ORDEN, LIMITES } from "../datos";
import {
  Animar,
  Btn,
  BtnCerrar,
  Chip,
  Entrada,
  Fab,
  Header,
  Pie,
  Sheet,
  Tarjeta,
  TituloSeccion,
  TxtBtn,
} from "../componentes";
import { useTema } from "../tema";
import { F } from "../fuentes";
import { IconoLlave, IconoLuna, IconoOjo, IconoUsers, IconoX } from "../iconos";
import { ajustesPorDefecto, cargarAjustes, guardarAjustes } from "../partida";

const REGLAS = [
  { t: "Reparte.", d: "Pasen el celular de mano en mano. Cada jugador presiona la carta para ver su papel en secreto y la devuelve tapada." },
  { t: "Describe.", d: "Por turnos, cada detective dice UNA palabra relacionada con la suya. El impostor no conoce la palabra: tendrá que improvisar sin que se note." },
  { t: "Debaten.", d: "Tras la vuelta completa, abran el debate con el cronómetro: ¿quién fue demasiado vago… o demasiado exacto?" },
  { t: "Voten.", d: "Si atrapan al impostor, gana el grupo. Si se escapa o acusan a un inocente… la ronda es suya." },
  { t: "Extras.", d: "Con «Mostrar pista» el impostor recibe una pista lejana para disimular. Con «Modo ¿Qué?», 1 de cada 10 partidas todos son impostores." },
];

export default function Inicio({ onEmpezar }) {
  const { colores } = useTema();
  const insets = { top: StatusBar.currentHeight || 0, bottom: 0 };
  const scrollRef = useRef(null);
  const yJugadores = useRef(0);

  const [ajustes, setAjustes] = useState(ajustesPorDefecto());
  const [verReglas, setVerReglas] = useState(false);
  const [verQuerido, setVerQuerido] = useState(false);

  useEffect(() => {
    cargarAjustes().then(setAjustes).catch(() => {});
  }, []);

  const nombresLlenos = useMemo(
    () => ajustes.jugadores.map((j) => j.trim()).filter(Boolean).length,
    [ajustes.jugadores]
  );

  // Con pocos jugadores no caben tantos impostores: máximo, menos de la mitad
  // (con 3 o 4 jugadores solo cabe 1; con 5 o 6, hasta 2; con 7 o más, 3).
  const maxImp = useMemo(() => Math.max(1, Math.floor((nombresLlenos - 1) / 2)), [nombresLlenos]);
  const numImp = Math.min(ajustes.numImpostores, maxImp);

  const alScrollJugadores = useCallback((e) => {
    yJugadores.current = e.nativeEvent.layout.y;
  }, []);

  const empezar = async () => {
    const nombres = ajustes.jugadores.map((j) => j.trim()).filter(Boolean);
    if (nombres.length < LIMITES.minJugadores) {
      Alert.alert("¿Quién es el impostor?", "Se necesitan al menos " + LIMITES.minJugadores + " jugadores con nombre.");
      return;
    }
    if (!ajustes.categorias.length) {
      Alert.alert("¿Quién es el impostor?", "Elige al menos una categoría de palabras.");
      return;
    }
    const finales = { ...ajustes, jugadores: nombres, numImpostores: numImp };
    await guardarAjustes(finales).catch(() => {});
    onEmpezar(finales);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colores.bg }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 + insets.bottom, paddingTop: insets.top }}
      >
        <Header />

        {/* HERO */}
        <View style={styles.hero}>
          <Animar>
            <Text style={[styles.heroTitulo, { color: colores.ink }]}>
              Reparte, trabaja en equipo y atrapen al impostor.
            </Text>
          </Animar>
          <Animar delay={150}>
            <Text style={[styles.heroSub, { color: colores.ink }]}>
              Los detectives conocen la palabra. El impostor no. Delata al que improvisa.
            </Text>
          </Animar>
          <Animar delay={300} style={styles.ctas}>
            <Btn primaria grande onPress={() => scrollRef.current?.scrollTo({ y: yJugadores.current, animated: true })}>
              <TxtBtn grande color={colores.textoBtnPrimario}>Empezar partida</TxtBtn>
            </Btn>
            <Btn grande gris onPress={() => setVerReglas(true)}>
                       <TxtBtn grande color={colores.textoBtnGris}>Cómo se juega</TxtBtn>
            </Btn>
          </Animar>
        </View>

        {/* AJUSTES · JUGADORES */}
        <Animar delay={80}>
          <View onLayout={alScrollJugadores} style={{ marginTop: 14 }}>
            <Tarjeta>
              <TituloSeccion icono={<IconoUsers tam={18} color={colores.iconoSeccion} />}>
                {"Jugadores (" + nombresLlenos + ")"}
              </TituloSeccion>
              {ajustes.jugadores.map((nombre, i) => (
                <View key={i} style={styles.filaJugador}>
                  <Entrada
                    value={nombre}
                    maxLength={20}
                    placeholder={"Nombre del jugador " + (i + 1)}
                    onChangeText={(v) => {
                      const jugadores = ajustes.jugadores.slice();
                      jugadores[i] = v;
                      setAjustes({ ...ajustes, jugadores });
                    }}
                  />
                  {ajustes.jugadores.length > LIMITES.minJugadores && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      accessibilityLabel={"Quitar jugador " + (i + 1)}
                      onPress={() => {
                        const jugadores = ajustes.jugadores.slice();
                        jugadores.splice(i, 1);
                        setAjustes({ ...ajustes, jugadores });
                      }}
                      style={[styles.btnX, { borderColor: colores.line2 }]}
                    >
                      <IconoX tam={16} color={colores.err} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <Btn
                disabled={ajustes.jugadores.length >= LIMITES.maxJugadores}
                onPress={() => setAjustes({ ...ajustes, jugadores: [...ajustes.jugadores, ""] })}
              >
                <TxtBtn color={colores.ink}>+ Agregar nombre del jugador</TxtBtn>
              </Btn>
            </Tarjeta>
          </View>
        </Animar>

        {/* AJUSTES · IMPOSTORES */}
        <Animar delay={160}>
          <Tarjeta>
            <TituloSeccion icono={<IconoOjo tam={18} color={colores.iconoSeccion} />}>
              {"Número de impostores: " + numImp}
            </TituloSeccion>
            <View style={styles.nube}>
              {LIMITES.impostores.map((v) => (
                <Chip
                  key={v}
                  activa={numImp === v}
                  disabled={v > maxImp}
                  forma={{ ancho: 46, alto: 46 }}
                  onPress={() => setAjustes({ ...ajustes, numImpostores: v })}
                >
                  {v}
                </Chip>
              ))}
            </View>
          </Tarjeta>
        </Animar>

        {/* AJUSTES · CATEGORÍAS */}
        <Animar delay={200}>
          <Tarjeta>
            <TituloSeccion icono={<IconoLlave tam={18} color={colores.iconoSeccion} />}>
              Categorías
            </TituloSeccion>
            <View style={styles.nube}>
              {CATEGORIAS_ORDEN.map((cat) => (
                <Chip
                  key={cat.id}
                  activa={ajustes.categorias.includes(cat.id)}
                  terna={colores.cats[cat.id]}
                  onPress={() => {
                    const categorias = ajustes.categorias.includes(cat.id)
                      ? ajustes.categorias.filter((x) => x !== cat.id)
                      : ajustes.categorias.concat(cat.id);
                    setAjustes({ ...ajustes, categorias });
                  }}
                >
                  {cat.emoji + " " + cat.nombre}
                </Chip>
              ))}
            </View>
          </Tarjeta>
        </Animar>

        {/* AJUSTES · EXTRAS */}
        <Animar delay={200}>
          <Tarjeta>
            <TituloSeccion icono={<IconoLuna tam={18} color={colores.iconoSeccion} />}>
              Extras
            </TituloSeccion>
            <View style={styles.nube}>
              <Chip activa={ajustes.mostrarPista} onPress={() => setAjustes({ ...ajustes, mostrarPista: !ajustes.mostrarPista })}>
                💡 Mostrar pista
              </Chip>
              <Chip activa={ajustes.modoQue} onPress={() => setAjustes({ ...ajustes, modoQue: !ajustes.modoQue })}>
                😈 Modo ¿Qué?
              </Chip>
            </View>
            <Text style={[styles.notaExtra, { color: colores.mut }]}>
              Con la pista activada, solo el impostor recibe una pista lejana para disimular. El modo ¿Qué? hace que 1 de cada 10 partidas todos sean impostores.
            </Text>
          </Tarjeta>
        </Animar>

        {/* EMPEZAR */}
        <Animar delay={240} style={styles.ctasCentradas}>
          <Btn primaria grande onPress={empezar}>
            <TxtBtn grande color={colores.textoBtnPrimario}>Empezar partida</TxtBtn>
          </Btn>
        </Animar>

        <Pie />
      </ScrollView>

      {/* FAB «Querido usuario» */}
      <Fab onPress={() => setVerQuerido(true)} />

      {/* Sheet: cómo se juega */}
      <Sheet visible={verReglas} onClose={() => setVerReglas(false)}>
        <View style={styles.sheetFila}>
          <Text style={[styles.sheetTitulo, { color: colores.ink }]}>Cómo se juega</Text>
          <BtnCerrar onPress={() => setVerReglas(false)} />
        </View>
        {REGLAS.map((r, i) => (
          <View key={i} style={[styles.regla, i < REGLAS.length - 1 && { borderBottomColor: colores.line2 }]}>
            <View style={[styles.reglaNum, { backgroundColor: colores.brand }]}>
              <Text style={[styles.reglaNumTexto, { color: colores.tinta }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.reglaTexto, { color: colores.ink }]}>
              <Text style={{ fontFamily: F.fuerza }}>{r.t} </Text>
              {r.d}
            </Text>
          </View>
        ))}
      </Sheet>

      {/* Sheet: Querido usuario */}
      <Sheet visible={verQuerido} onClose={() => setVerQuerido(false)}>
        <View style={styles.sheetFila}>
          <Text style={[styles.sheetTitulo, { color: colores.ink }]}>Querido usuario</Text>
          <BtnCerrar onPress={() => setVerQuerido(false)} />
        </View>
        <Text style={[styles.textoQuerido, { color: colores.ink }]}>
          Esta app fue creada por <Text style={{ fontFamily: F.fuerza, color: colores.brand }}>@samuk_xx</Text> para evitar los molestos anuncios y ventanas emergentes invasivas que aparecen al usar otras aplicaciones similares. Disfruta de la app y recuerda que fue hecha especialmente para nosotros, los hermanos paraguayos.
        </Text>
        <Text style={[styles.textoQuerido, { color: colores.ink }]}>Y eso, ndi legalmente.</Text>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 4 },
  heroTitulo: {
    fontFamily: F.displayFuerte,
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -1.3,
    maxWidth: 320,
    marginVertical: 8,
  },
  heroSub: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 420,
    textAlign: "justify",
    marginBottom: 24,
  },
  ctas: { gap: 12, alignItems: "flex-start" },
  filaJugador: { flexDirection: "row", gap: 8, marginBottom: 8 },
  btnX: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nube: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  notaExtra: { fontSize: 13, lineHeight: 19, marginTop: 10, textAlign: "justify" },
  ctasCentradas: { flexDirection: "column", alignItems: "center", gap: 10 },
  sheetFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sheetTitulo: { fontFamily: F.displayFuerte, fontSize: 21, letterSpacing: -0.4 },
  regla: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderStyle: "dashed",
  },
  reglaNum: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reglaNumTexto: { fontFamily: F.fuerza, fontSize: 14 },
  reglaTexto: { flex: 1, fontSize: 15, lineHeight: 21, textAlign: "justify" },
  textoQuerido: { fontSize: 15, lineHeight: 25, textAlign: "justify", marginBottom: 10 },
});
