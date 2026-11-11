/* fuentes.js · familias tipográficas del sitio (Inter + Space Grotesk),
   cargadas como assets nativos para que se vean igual que en la web. */

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

/** Mapa para el hook useFonts() de expo-font (App.js) */
export const FUENTES_CARGA = {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
};

/** Nombres de familia listos para usar en estilos:
    F.cuerpo ≈ --sans, F.display ≈ --disp */
export const F = {
  cuerpo: "Inter_400Regular",
  medio: "Inter_600SemiBold",
  fuerte: "Inter_700Bold",
  display: "SpaceGrotesk_500Medium",
  displayFuerte: "SpaceGrotesk_700Bold",
};
