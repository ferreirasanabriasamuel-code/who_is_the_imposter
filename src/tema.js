/* ============================================================
   tema.js · modo claro/oscuro compartido
   Tokens copiados de css/base.css. El tema se guarda en
   AsyncStorage con la MISMA clave que la web ("impostor_theme")
   y por defecto es oscuro, igual que el script inline del <head>.
   ============================================================ */

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CLAVE_TEMA = "impostor_theme";

/* ---------- Tokens (tema oscuro por defecto) ---------- */
export const OSCURO = {
  bg: "#000000",
  card: "#0c0c0b",
  card2: "#131311",
  ink: "#f6f2e3",
  mut: "#98917b",
  line: "#1f1f19",
  line2: "#2e2d22",
  brand: "#ffd500",
  tinta: "#0a0a08",
  rojo: "#ff4d40",
  ok: "#4ade80",
  err: "#ff6b6b",
  warn: "#ffd500",
  // Ternas de categorías (claro/oscuro vía tokens)
  cats: {
    comida: { c: "#ffb020", bg: "rgba(255,176,32,.12)", bd: "rgba(255,176,32,.45)" },
    deportes: { c: "#2fd4b5", bg: "rgba(47,212,181,.12)", bd: "rgba(47,212,181,.45)" },
    peliculas: { c: "#ff5c8a", bg: "rgba(255,92,138,.12)", bd: "rgba(255,92,138,.45)" },
    lugares: { c: "#a78bff", bg: "rgba(167,139,255,.12)", bd: "rgba(167,139,255,.45)" },
    animales: { c: "#4ade80", bg: "rgba(74,222,128,.12)", bd: "rgba(74,222,128,.45)" },
    profesiones: { c: "#60a5fa", bg: "rgba(96,165,250,.12)", bd: "rgba(96,165,250,.45)" },
    objetos: { c: "#38bdf8", bg: "rgba(56,189,248,.12)", bd: "rgba(56,189,248,.45)" },
    famosas: { c: "#ff7b72", bg: "rgba(255,123,114,.12)", bd: "rgba(255,123,114,.45)" },
  },
};

/* ---------- Tokens del modo claro ---------- */
export const CLARO = {
  bg: "#f6f4ec",
  card: "#fffdf5",
  card2: "#efece0",
  ink: "#191712",
  mut: "#6f6a5b",
  line: "#e3dfd0",
  line2: "#cfcaba",
  brand: "#ffd500",
  tinta: "#191712",
  rojo: "#d3271a",
  ok: "#1a9e56",
  err: "#d92c3c",
  warn: "#b98d00",
  // Categorías: versiones más oscuras para contrastar sobre papel
  cats: {
    comida: { c: "#a86500", bg: "rgba(168,101,0,.10)", bd: "rgba(168,101,0,.40)" },
    deportes: { c: "#0d7d69", bg: "rgba(13,125,105,.10)", bd: "rgba(13,125,105,.40)" },
    peliculas: { c: "#c22553", bg: "rgba(194,37,83,.10)", bd: "rgba(194,37,83,.40)" },
    lugares: { c: "#6247c4", bg: "rgba(98,71,196,.10)", bd: "rgba(98,71,196,.40)" },
    animales: { c: "#1e7a3c", bg: "rgba(30,122,60,.10)", bd: "rgba(30,122,60,.40)" },
    profesiones: { c: "#1d5fb0", bg: "rgba(29,95,176,.10)", bd: "rgba(29,95,176,.40)" },
    objetos: { c: "#0c6a9c", bg: "rgba(12,106,156,.10)", bd: "rgba(12,106,156,.40)" },
    famosas: { c: "#b3422f", bg: "rgba(179,66,47,.10)", bd: "rgba(179,66,47,.40)" },
  },
};

const Ctx = createContext(null);

export function ProveedorTema({ children }) {
  const [tema, setTema] = useState("dark");

  // El tema inicial se lee del almacenamiento (el default oscuro evita destello)
  useEffect(() => {
    AsyncStorage.getItem(CLAVE_TEMA)
      .then((t) => {
        if (t === "light" || t === "dark") setTema(t);
      })
      .catch(() => {});
  }, []);

  const alternar = () => {
    setTema((actual) => {
      const nuevo = actual === "light" ? "dark" : "light";
      AsyncStorage.setItem(CLAVE_TEMA, nuevo).catch(() => {});
      return nuevo;
    });
  };

  const colores = tema === "light" ? CLARO : OSCURO;
  return <Ctx.Provider value={{ tema, colores, alternar }}>{children}</Ctx.Provider>;
}

export const useTema = () => useContext(Ctx);
