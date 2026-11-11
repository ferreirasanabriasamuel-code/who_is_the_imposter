# ¿Quién es el impostor? · App Android

Conversión de la página web **impostor-web** a un proyecto **Expo (React Native)** que se
compila a **APK** con GitHub Actions. Todo el contenido, la lógica, los sonidos y la
interfaz del sitio están portados 1:1:

- **Inicio**: hero, jugadores (3–20), número de impostores (1/2/3 con el máximo
  "menos de la mitad"), categorías coloreadas (8), extras «Mostrar pista» y
  «Modo ¿Qué?», sheets «Cómo se juega» y «Querido usuario», FAB ⓘ y footer.
- **Reparto**: carta que gira al **mantener presionada** y vuelve al soltar, con el
  pop de la palabra, IMPOSTOR en rojo y pista para el impostor si está activada.
- **Juego**: «Empieza: …» al azar, cronómetro de debate (anillo SVG, presets
  1/2/3/5 min y «∞ Sin límite» que cuenta hacia arriba, pausa/reanudar/reiniciar,
  modo urgente con latido en los últimos 10 s y sacudida al agotarse), revelación
  de impostor(es) y palabra, y «Nuevo juego».
- **Sonido**: el mismo «pop» del sitio (WebAudio) pre-renderizado en 5 variantes WAV
  con los parámetros exactos del original (920–1080 Hz → 520 Hz, envolvente 0.11 s),
  suena al pulsar cualquier botón.
- **Tema**: claro/oscuro persistente con la misma clave (`impostor_theme`), paleta
  idéntica (negro + #FFD500 en oscuro, papel + #FFD500 en claro).
- **Datos**: `src/datos.js` es la misma fuente de verdad (157 palabras con pistas).
- **Persistencia**: ajustes y partida en AsyncStorage con las mismas claves del
  localStorage web (`impostor_ajustes`, `impostor_partida`).

## Estructura

```
.github/workflows/apk.yml   ← tu workflow original, sin cambios
App.js                       ← router de las 3 pantallas + fuentes + tema
app.json                     ← nombre, icono (1024), icono adaptativo, splash
src/
  datos.js                   ← RAW + CATEGORIAS + LIMITES (igual al web)
  partida.js                 ← azar, barajar, crearPartida, storage
  sonido.js                  ← pop en cada botón (expo-av + WAVs generados)
  tema.js                    ← tokens claro/oscuro de base.css
  fuentes.js                 ← Inter 400/600/700 + Space Grotesk 500/700
  iconos.js                  ← iconos SVG (Lucide) con react-native-svg
  componentes.js             ← Btn, Chip, Tarjeta, Sheet, Animar, Header, Pie…
  pantallas/
    Inicio.js                ← index.html + ajustes.js + reglas.js
    Reparto.js               ← reparto.html + reparto.js (carta flip)
    Juego.js                 ← juego.html + juego.js + tiempo.js (cronómetro)
assets/
  icono.png                  ← icono original de la web (1024×1024)
  icono-adaptivo.png         ← foreground del icono adaptativo Android
  splash-icon.png            ← imagen del splash
  sonidos/pop1..5.wav        ← pops generados (mismos parámetros que sonido.js)
```

## Cómo generar el APK

1. Crea un repositorio en GitHub (por ejemplo `impostor-app`).
2. Sube TODO el contenido de esta carpeta a la rama `main`:

   ```bash
   cd impostor-app
   git init
   git add .
   git commit -m "App impostor lista para compilar"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/impostor-app.git
   git push -u origin main
   ```

3. En GitHub entra a la pestaña **Actions** → workflow **Build APK**.
   También puedes lanzarlo a mano con **Run workflow** (`workflow_dispatch`).
4. Espera la compilación (~10–15 min la primera vez). Al terminar, en la página del
   run, abajo en **Artifacts**, descarga **Impostor-APK** (contiene
   `app-release.apk`).
5. Copia el APK al celular y ábrelo (permite "instalar apps de fuentes desconocidas").

> El APK se firma con la keystore de debug (configuración por defecto del template de
> Expo), así que es instalable directo. Si más adelante lo quieres publicar en Play
> Store, ahí sí conviene una keystore propia.

## Probar en desarrollo (opcional)

Con Node 20+ instalado:

```bash
npm install
npx expo start
```

y escanea el QR con la app **Expo Go** en tu celular.

## Notas técnicas

- **Expo SDK 51 / React Native 0.74**: genera `compileSdk 34`, `targetSdk 34` y
  `build-tools 34.0.0`, exactamente lo que instala tu workflow con
  `sdkmanager "platforms;android-34" "build-tools;34.0.0"`.
- La carpeta `android/` NO está en el repo: la genera `npx expo prebuild` en el CI
  (paso 3 del workflow). Está en `.gitignore` para que prebuild no falle al
  encontrarla.
- `package-lock.json` está incluido para que `npm install` en CI use las mismas
  versiones verificadas.
