/* ============================================================
   componentes.js · piezas reutilizables con el look del sitio
   (css/base.css + actividades.css + premium.css portados a RN).
   Cada botón/chip suelta el tic de sonido, igual que el listener
   global de sonido.js en la web.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTema } from "./tema";
import { F } from "./fuentes";
import { tocar } from "./sonido";
import { IconoInfo, IconoLuna, IconoLupa, IconoSol } from "./iconos";

/* Texto estándar de botón (.btn usa Inter 700 / .95rem, .big 1.05rem) */
export function TxtBtn({ grande = false, color, children }) {
  return (
    <Text style={{ fontFamily: F.fuerza, fontSize: grande ? 17 : 15, color }}>
      {children}
    </Text>
  );
}

/* ---------- Botón (.btn / .btn.primary / .btn.big / variante gris) ---------- */
export function Btn({ primaria = false, grande = false, gris = false, onPress, disabled = false, style, children }) {
  const { colores } = useTema();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled}
      onPress={(e) => {
        if (!disabled) tocar();
        if (onPress) onPress(e);
      }}
      style={[
        styles.btn,
        grande && styles.btnGrande,
        gris
          ? { backgroundColor: colores.btnGris, borderColor: colores.btnGrisBorde }
          : primaria
            ? { backgroundColor: colores.btnPrimario, borderColor: "transparent", shadowColor: colores.btnPrimario }
            : { backgroundColor: colores.card, borderColor: colores.line2 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

/* ---------- Chip (.chip / .chip.activa / categoría coloreada) ---------- */
export function Chip({
  activa = false,
  onPress,
  disabled = false,
  terna = null, // { c, bg, bd } para chips de categoría
  forma = null, // { ancho, alto } para píldoras circulares
  style,
  children,
}) {
  const { colores } = useTema();
  const colorFondo = activa
    ? colores.brand
    : terna
      ? terna.bg
      : colores.card;
  const colorTexto = activa ? colores.tinta : terna ? terna.c : colores.ink;
  const colorBorde = activa ? "transparent" : terna ? terna.bd : colores.line2;
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={disabled}
      onPress={(e) => {
        if (!disabled) tocar();
        if (onPress) onPress(e);
      }}
      style={[
        styles.chip,
        { backgroundColor: colorFondo, borderColor: colorBorde },
        forma && { width: forma.ancho, height: forma.alto, paddingHorizontal: 0, borderRadius: 999 },
        disabled && { opacity: 0.35 },
        style,
      ]}
    >
      <Text style={[styles.chipTexto, { color: colorTexto }]}>{children}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Tarjeta de sección (.tarjeta) + título con icono ---------- */
export function Tarjeta({ children, style }) {
  const { colores } = useTema();
  return (
    <View
      style={[
        styles.tarjeta,
        { backgroundColor: colores.card, borderColor: colores.line },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function TituloSeccion({ icono, children }) {
  const { colores } = useTema();
  return (
    <View style={styles.tituloFila}>
      <View style={{ marginRight: 8 }}>{icono}</View>
      <Text style={[styles.tituloTexto, { color: colores.ink }]}>{children}</Text>
    </View>
  );
}

/* ---------- Entrada de texto (.entrada) ---------- */
export function Entrada(props) {
  const { colores } = useTema();
  const [enfocado, setEnfocado] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colores.mut}
      underlineColorAndroid="transparent"
      onFocus={() => setEnfocado(true)}
      onBlur={() => setEnfocado(false)}
      {...props}
      style={[
        styles.entrada,
        {
          backgroundColor: colores.card2,
          borderColor: enfocado ? colores.brand : colores.line2,
          color: colores.ink,
        },
        props.style,
      ]}
    />
  );
}

/* ---------- Animación de entrada (.animar · aparecer) ---------- */
export function Animar({ delay = 0, style, children }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 450,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ---------- Pop del contenido del dorso (@keyframes pop) ---------- */
export function usePop() {
  const op = useRef(new Animated.Value(0)).current;
  const esc = useRef(new Animated.Value(0.55)).current;
  const animar = () => {
    op.setValue(0);
    esc.setValue(0.55);
    Animated.sequence([
      Animated.delay(220),
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(esc, { toValue: 1.08, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(esc, { toValue: 1, duration: 160, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  };
  return { op, esc, animar };
}

/* ---------- Header (título + botón de tema) ---------- */
export function Header() {
  const { colores, tema, alternar } = useTema();
  return (
    <View style={styles.header}>
      <Text style={[styles.h1, { color: colores.ink }]}>
        ¿Quién es{"\n"}
        el <Text style={{ color: colores.rojo }}>Impostor</Text>?
      </Text>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          tocar();
          alternar();
        }}
        style={[styles.btnTema, { borderColor: colores.line2, backgroundColor: colores.card }]}
      >
        {tema === "light" ? <IconoLuna tam={20} color={colores.ink} /> : <IconoSol tam={20} color={colores.ink} />}
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Footer (.pie-marca) ---------- */
export function Pie() {
  const { colores } = useTema();
  return (
    <View style={styles.pie}>
      <View style={[styles.logoMini, { backgroundColor: colores.logoPieBg }]}>
        <IconoLupa tam={14} color={colores.logoPieTinta} />
      </View>
      <Text style={[styles.pieTexto, { color: colores.mut, fontFamily: F.displayFuerte }]}>
        ¿Quién es el impostor?
      </Text>
    </View>
  );
}

/* ---------- FAB ⓘ (botón «Querido usuario») ---------- */
export function Fab({ onPress }) {
  const { colores } = useTema();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={(e) => {
        tocar();
        if (onPress) onPress(e);
      }}
      style={[styles.fab, { borderColor: colores.line, backgroundColor: colores.card }]}
    >
      <IconoInfo tam={22} color={colores.ink} />
    </TouchableOpacity>
  );
}

/* ---------- Modal tipo sheet (.overlay / .sheet) ---------- */
export function Sheet({ visible, onClose, children }) {
  const { colores } = useTema();
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colores.card, borderColor: colores.line },
          ]}
          onPress={(e) => e.stopPropagation?.()}
        >
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* Botón de cerrar del sheet (.btn.cerrar) */
export function BtnCerrar({ onPress }) {
  const { colores } = useTema();
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => {
        tocar();
        if (onPress) onPress();
      }}
      style={[styles.btnCerrar, { backgroundColor: colores.card, borderColor: colores.line2 }]}
    >
      <Text style={{ color: colores.ink, fontSize: 15, fontFamily: F.medio }}>✕</Text>
    </TouchableOpacity>
  );
}

/* ---------- Texto resaltado (<mark>) ---------- */
export function Marca({ children }) {
  const { colores } = useTema();
  return (
    <Text
      style={{
        backgroundColor: "rgba(255,213,0,0.35)",
        color: colores.ink,
        fontWeight: "700",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {children}
    </Text>
  );
}

/* ---------- Hoja de estilos compartida ---------- */
const sombraTarjeta = Platform.select({
  android: { elevation: 3 },
  ios: { shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } },
});

export const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnGrande: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipTexto: {
    fontSize: 14,
    fontFamily: F.medio,
  },
  tarjeta: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    ...sombraTarjeta,
  },
  tituloFila: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tituloTexto: {
    fontFamily: F.displayFuerte,
    fontSize: 17,
    letterSpacing: -0.3,
  },
  entrada: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    fontFamily: F.cuerpo,
    textAlignVertical: "center",
  },
  header: {
    position: "relative",
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  h1: {
    fontFamily: F.displayFuerte,
    textAlign: "center",
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  btnTema: {
    position: "absolute",
    right: 18,
    top: 18,
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "86%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 40,
  },
  btnCerrar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 24,
    paddingBottom: 30,
  },
  logoMini: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  pieTexto: {
    fontSize: 14,
    color: undefined,
  },
});
