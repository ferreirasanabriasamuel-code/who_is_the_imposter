/* ============================================================
   App.js · raíz de la app
   Carga las fuentes (Inter + Space Grotesk), provee el tema y
   navega entre las tres pantallas del sitio: Inicio, Reparto y
   Juego. La partida vive en AsyncStorage, igual que el localStorage web.
   ============================================================ */

import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { FUENTES_CARGA } from "./src/fuentes";
import { ProveedorTema, useTema } from "./src/tema";
import { borrarPartida, crearPartida, guardarPartida } from "./src/partida";
import Inicio from "./src/pantallas/Inicio";
import Reparto from "./src/pantallas/Reparto";
import Juego from "./src/pantallas/Juego";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts(FUENTES_CARGA);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ProveedorTema>
      <Router />
    </ProveedorTema>
  );
}

function Router() {
  const { tema } = useTema();
  const [pantalla, setPantalla] = useState("inicio");
  const [partida, setPartida] = useState(null);

  // Protección de páginas de juego: sin partida válida, volver al inicio
  const partidaValida =
    partida && Array.isArray(partida.jugadores) && partida.jugadores.length >= 3;

  async function empezar(ajustes) {
    const p = crearPartida(ajustes);
    await guardarPartida(p).catch(() => {});
    setPartida(p);
    setPantalla("reparto");
  }

  async function avanzar(p) {
    await guardarPartida(p).catch(() => {});
    setPartida(p);
    if (p.turno >= p.jugadores.length) setPantalla("juego");
  }

  async function nuevoJuego() {
    await borrarPartida().catch(() => {});
    setPartida(null);
    setPantalla("inicio");
  }

  let contenido = <Inicio onEmpezar={empezar} />;
  if (pantalla === "reparto" && partidaValida) {
    contenido = <Reparto partida={partida} onSiguiente={avanzar} onTerminar={avanzar} />;
  } else if (pantalla === "juego" && partidaValida) {
    contenido = <Juego partida={partida} onNuevoJuego={nuevoJuego} />;
  }

  return (
    <>
      <StatusBar style={tema === "light" ? "dark" : "light"} />
      {contenido}
    </>
  );
}
