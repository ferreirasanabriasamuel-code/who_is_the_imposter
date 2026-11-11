/* ============================================================
   iconos.js · iconos SVG en línea (estilo Lucide), portados 1:1
   del sitio (js/componentes.js + svg inline del HTML).
   Uso: <IconoUsers tam={18} color={colores.brand} />
   ============================================================ */

import React from "react";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";

function Base({ tam = 18, color = "#000", children }) {
  return (
    <Svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export const IconoUsers = (p) => (
  <Base {...p}>
    <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Base>
);

export const IconoOjo = (p) => (
  <Base {...p}>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <Circle cx="12" cy="12" r="3" />
  </Base>
);

export const IconoLlave = (p) => (
  <Base {...p}>
    <Path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </Base>
);

export const IconoTimer = (p) => (
  <Base {...p}>
    <Line x1="10" x2="14" y1="2" y2="2" />
    <Line x1="12" x2="15" y1="14" y2="11" />
    <Circle cx="12" cy="14" r="8" />
  </Base>
);

export const IconoDebate = (p) => (
  <Base {...p}>
    <Path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </Base>
);

export const IconoLuna = (p) => (
  <Base {...p}>
    <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Base>
);

export const IconoSol = (p) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="4" />
    <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </Base>
);

export const IconoFlecha = (p) => (
  <Base {...p}>
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Base>
);

export const IconoX = (p) => (
  <Base {...p}>
    <Path d="M18 6 6 18" />
    <Path d="m6 6 12 12" />
  </Base>
);

export const IconoPausa = (p) => (
  <Base {...p}>
    <Rect x="6" y="4" width="4" height="16" rx="1" />
    <Rect x="14" y="4" width="4" height="16" rx="1" />
  </Base>
);

export const IconoPlay = (p) => (
  <Base {...p}>
    <Polygon points="6 3 20 12 6 21 6 3" />
  </Base>
);

export const IconoInfo = (p) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4" />
    <Path d="M12 8h.01" />
  </Base>
);

export const IconoLupa = (p) => (
  <Base {...p}>
    <Circle cx="11" cy="11" r="7" />
    <Path d="m20 20-3.5-3.5" />
  </Base>
);
