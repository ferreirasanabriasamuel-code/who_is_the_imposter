/* ============================================================
   partida.js · estado del juego compartido entre pantallas
   La partida y los ajustes viven en AsyncStorage (equivalente
   nativo del localStorage web) con las MISMAS claves, para que
   el comportamiento sea idéntico al sitio.
   Portado 1:1 desde js/partida.js.
   ============================================================ */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CATEGORIAS, LIMITES, RAW } from "./datos";

export const CLAVE_PARTIDA = "impostor_partida";
export const CLAVE_AJUSTES = "impostor_ajustes";

/** Elegir un elemento al azar de una lista */
export function azar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

/** Barajar una lista (Fisher-Yates) y devolver una copia */
export function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Ajustes por defecto (usados si el jugador no ha guardado nada aún) */
export function ajustesPorDefecto() {
  return {
    jugadores: ["", "", ""],
    numImpostores: 1,
    categorias: CATEGORIAS.map((c) => c.id),
    mostrarPista: false, // con la pista activada, SOLO el impostor recibe una pista lejana
    modoQue: false, // 1 de cada 10 partidas: ¡todos son impostores!
  };
}

/** Cargar los últimos ajustes guardados (o los por defecto) */
export async function cargarAjustes() {
  try {
    const g = JSON.parse(await AsyncStorage.getItem(CLAVE_AJUSTES));
    if (g && Array.isArray(g.jugadores) && g.jugadores.length >= LIMITES.minJugadores) return g;
  } catch (e) {
    /* ajustes corruptos: se usan los de defecto */
  }
  return ajustesPorDefecto();
}

export async function guardarAjustes(a) {
  await AsyncStorage.setItem(CLAVE_AJUSTES, JSON.stringify(a));
}

/**
 * Crear una partida nueva a partir de los ajustes.
 * Devuelve el objeto partida (el llamador lo persiste).
 */
export function crearPartida(ajustes) {
  const nombres = ajustes.jugadores.map((n) => n.trim()).filter(Boolean);
  const n = nombres.length;

  // La palabra sale SOLO de las categorías elegidas (derivado de datos.js)
  const catsElegidas = CATEGORIAS.filter((c) => ajustes.categorias.includes(c.id));
  const cat = azar(catsElegidas.length ? catsElegidas : CATEGORIAS);
  const filasCat = RAW.filter((f) => f[0] === cat.id);
  const fila = azar(filasCat);

  // Modo "¿Qué?": con probabilidad 1/10, TODOS los jugadores son impostores
  // y nadie conocerá la palabra.
  const todosImpostores = !!ajustes.modoQue && Math.random() < 1 / 10;

  // Reparto aleatorio de impostores (máx. uno menos que la mitad de jugadores)
  const maxImp = Math.max(1, Math.floor((n - 1) / 2));
  const numImp = todosImpostores ? n : Math.min(ajustes.numImpostores, maxImp);
  const impostores = barajar([...Array(n).keys()]).slice(0, numImp).sort((a, b) => a - b);

  const partida = {
    jugadores: nombres,
    numImpostores: numImp,
    categoriasElegidas: ajustes.categorias.slice(),
    categoriaId: cat.id,
    categoriaNombre: cat.nombre,
    categoriaEmoji: cat.emoji,
    palabra: todosImpostores ? null : fila[1],
    // Las palabras tienen varias pistas en datos.js: se sortea una por partida
    pista: azar(fila.slice(2)),
    mostrarPista: !!ajustes.mostrarPista,
    todosImpostores,
    impostores,
    turno: 0, // índice del jugador que tiene el celular
  };
  return partida;
}

/** Cargar la partida en curso (o null si no hay) */
export async function cargarPartida() {
  try {
    return JSON.parse(await AsyncStorage.getItem(CLAVE_PARTIDA));
  } catch (e) {
    return null;
  }
}

export async function guardarPartida(p) {
  await AsyncStorage.setItem(CLAVE_PARTIDA, JSON.stringify(p));
}

/** Terminar la partida: se borra y se vuelve al inicio */
export async function borrarPartida() {
  await AsyncStorage.removeItem(CLAVE_PARTIDA);
}

/** ¿El jugador en el índice i es impostor? */
export function esImpostor(partida, i) {
  return partida.impostores.includes(i);
}
