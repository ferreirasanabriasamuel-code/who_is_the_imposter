/* ============================================================
   sonido.js · tic suave al pulsar cualquier botón.
   El sitio sintetiza el "pop" con WebAudio; en la app se usan los
   MISMOS parámetros pre-renderizados en 5 variantes WAV (frecuencia
   inicial 920–1080 Hz → 520 Hz, envolvente de 0.11 s) para que los
   toques seguidos no suenen robóticos. Los sonidos se crean en el
   primer toque (gesto del usuario); si algo falla, el juego sigue igual.
   ============================================================ */

import { Audio } from "expo-av";

const FUENTES = [
  require("../assets/sonidos/pop1.wav"),
  require("../assets/sonidos/pop2.wav"),
  require("../assets/sonidos/pop3.wav"),
  require("../assets/sonidos/pop4.wav"),
  require("../assets/sonidos/pop5.wav"),
];

let sonidos = null;
let preparando = null;

async function asegurar() {
  if (sonidos) return;
  if (!preparando) {
    preparando = (async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
        const creados = [];
        for (const f of FUENTES) {
          const { sound } = await Audio.Sound.createAsync(f);
          creados.push(sound);
        }
        sonidos = creados;
      } catch (e) {
        sonidos = null;
      }
    })();
  }
  await preparando;
}

/** Pop corto con tono ligeramente variable (equivale a tocar() del web) */
export async function tocar() {
  try {
    await asegurar();
    if (!sonidos || !sonidos.length) return;
    const s = sonidos[Math.floor(Math.random() * sonidos.length)];
    await s.replayAsync();
  } catch (e) {
    /* sin sonido: la partida no se interrumpe */
  }
}
