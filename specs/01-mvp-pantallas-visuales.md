# SPEC 01 — MVP visual de Arcade Vault (todas las pantallas)

> **Status:** Implementado
> **Depends on:** Ninguna
> **Date:** 2026-10-30
> **Objective:** Portar a Next.js App Router las cinco pantallas de `references/templates/` (biblioteca, detalle, reproductor, auth y salón de la fama) con datos ficticios y sin implementar ningún juego.

---

## Por qué existe esta spec

El código actual es el scaffold de Next.js. Ya existen en `app/layout.tsx` las fuentes (`--font-press-start`, `--font-courier-prime`, `--font-jetbrains-mono`) y en `app/globals.css` los estilos portados de `references/templates/styles.css`. Falta portar la estructura React: la plantilla es un SPA con React UMD, Babel en el navegador y navegación por hash, y eso no encaja con el App Router.

---

## Alcance

**Dentro:**

- Rutas reales del App Router:
  - `/` → Biblioteca (hero, búsqueda, chips de categoría, grilla de juegos).
  - `/juegos/[id]` → Detalle del juego con ranking top 10.
  - `/juegos/[id]/jugar` → Reproductor simulado.
  - `/auth` → Iniciar sesión / Crear cuenta / Jugar como invitado.
  - `/salon` → Salón de la Fama con pestañas por juego, podio y tabla.
- Layout compartido con `Nav` (con menú móvil), `footer` y fondo (`av-bg`, `av-noise`).
- Datos ficticios en `app/data/`, tipados, pensados para ser reemplazados por una base de datos.
- Sesión falsa en cliente: `localStorage` (`av_user`) expuesta con un Context.
- Reproductor con shell simulado: HUD, marco CRT, arena decorativa, puntuación que sube sola, pausa, fin de juego y modal para guardar la puntuación.
- Guardar puntuación escribe en `localStorage` (`av_scores`). Ninguna pantalla lee esa clave todavía.
- Elementos decorativos sin acción: botones Google/GitHub, texto de términos y contador `CRÉDITOS · 03`.
- `404` (`notFound()`) cuando el `id` del juego no existe.
- Cambiar `<html lang="en">` a `lang="es"` y actualizar `metadata` al español.

**Fuera de alcance (para otras specs):**

- Implementación de cualquier juego (canvas, lógica, controles).
- Backend, base de datos, autenticación real, OAuth con Google/GitHub.
- Mostrar en el Salón o el Detalle las puntuaciones guardadas en `av_scores`.
- Contador de créditos funcional.
- Menú desplegable de usuario (en la plantilla, el botón con el nombre solo cierra sesión).
- Internacionalización (la UI queda solo en español).
- Tests automatizados (el proyecto no tiene runner configurado).

---

## Modelo de datos

```ts
// app/data/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;            // slug de la URL: "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;         // clase CSS existente en globals.css: "cover-bricks"
  color: GameColor;
  best: number;
  plays: string;         // "12.4K"
}

export const GAMES: Game[];                       // los 8 juegos de data.jsx
export const CATS: ("TODOS" | GameCategory)[];
export function getGame(id: string): Game | undefined;
```

```ts
// app/data/scores.ts
export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;          // "DD/MM/2026"
}

export function seededScores(seed: number, count?: number): ScoreRow[]; // determinista, igual que data.jsx
```

```ts
// sesión (cliente) — app/components/session-provider.tsx
export interface User { name: string }              // en mayúsculas, máx. 10 caracteres
// localStorage "av_user": User | ausente → invitado
// localStorage "av_scores": { game: string; score: number; name: string; at: number }[]
```

Convenciones:

- Los datos de `app/data/` se importan solo desde Server Components o desde props; los Client Components reciben lo que necesitan por props.
- Los números se formatean con `toLocaleString("es-ES")`.
- La plantilla es la fuente de verdad visual; los textos se copian tal cual.

---

## Plan de implementación

1. Crear `app/data/games.ts` y `app/data/scores.ts` portando `data.jsx` a TypeScript. Verificación: `npm run lint` y `npx tsc --noEmit` sin errores.
2. Crear `app/components/session-provider.tsx` (Context + hook `useSession`, lectura de `av_user` tras montar para evitar errores de hidratación). Sin consumidores todavía.
3. Crear `app/components/nav.tsx` (Client Component: enlaces con `usePathname` para el estado activo, menú móvil, botón de sesión) y `app/components/footer.tsx`. Modificar `app/layout.tsx` para envolver con el provider, renderizar `Nav` y `footer`, y poner `lang="es"`. Verificación: el Nav aparece en `/` y los enlaces navegan.
4. Reemplazar `app/page.tsx` por la Biblioteca. Crear `app/components/game-card.tsx` (efecto tilt) y `app/components/library.tsx` (Client Component con búsqueda y chips). Verificación: filtrar por texto y categoría, estado vacío "NO HAY RESULTADOS".
5. Crear `app/juegos/[id]/page.tsx` (Detalle + ranking con `seededScores`, `notFound()` si no existe, `generateStaticParams`). Verificación: clic en una tarjeta lleva al detalle; un `id` inválido muestra 404.
6. Crear `app/auth/page.tsx` y `app/components/auth-form.tsx` (pestañas, envío que llama `login`, "Jugar como invitado" que cierra sesión y redirige a `/`). Conectar el botón de sesión del Nav con el provider. Verificación: tras entrar, el Nav muestra el nombre y se mantiene al recargar.
7. Crear `app/salon/page.tsx` y `app/components/hall-of-fame.tsx` (pestañas por juego, podio, tabla, fila "TU MEJOR MARCA" solo con sesión). Verificación: cambiar de pestaña cambia el podio y la tabla.
8. Crear `app/juegos/[id]/jugar/page.tsx` y `app/components/game-player.tsx` (HUD, CRT, pausa, fin de juego, modal, guardado en `av_scores`). Conectar el botón "JUGAR AHORA" del detalle. Verificación: la puntuación sube, pausa la detiene, FIN abre el modal, guardar escribe en `localStorage`.

---

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npx tsc --noEmit` termina sin errores.
- [ ] `npm run build` termina sin errores.
- [ ] `/`, `/salon`, `/auth`, `/juegos/bloque-buster` y `/juegos/bloque-buster/jugar` responden 200 en `npm run dev`.
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` muestran la página 404.
- [ ] La Biblioteca muestra las 8 tarjetas de `GAMES`.
- [ ] Escribir "caí" en el buscador deja solo la tarjeta CAÍDA; una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] El chip SHOOTER muestra exactamente INVASORES y ROCAS.
- [ ] Hacer clic en una tarjeta o en su botón JUGAR navega a `/juegos/[id]`.
- [ ] El Detalle muestra categoría, descripción larga, partidas, mejor global y 10 filas de ranking.
- [ ] El ranking de un mismo juego es idéntico entre recargas.
- [ ] Desde el Detalle, "JUGAR AHORA" lleva a `/jugar` y "VOLVER AL VAULT" a `/`.
- [ ] En `/jugar`, la puntuación aumenta sola; PAUSA la detiene y muestra "EN PAUSA"; REANUDAR continúa.
- [ ] En `/jugar`, FIN abre el modal "FIN DEL JUEGO"; guardar muestra "PUNTUACIÓN GUARDADA_" y agrega un registro a `localStorage["av_scores"]`.
- [ ] "JUGAR DE NUEVO" reinicia puntuación, vidas y nivel; SALIR vuelve al Detalle.
- [ ] En `/auth`, la pestaña "CREAR CUENTA" muestra el campo de correo y "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario con usuario "px_kai" guarda `{ "name": "PX_KAI" }` en `localStorage["av_user"]`, redirige a `/` y el Nav muestra "PX_KAI ▾".
- [ ] Con el formulario vacío, el nombre resultante es "PLAYER1".
- [ ] Recargar la página conserva la sesión; hacer clic en el botón con el nombre en el Nav la cierra.
- [ ] "JUGAR COMO INVITADO" deja sin sesión y redirige a `/`.
- [ ] Los botones Google, GitHub y el contador de créditos no producen navegación ni cambios de estado.
- [ ] El Salón muestra una pestaña por juego (8), podio con 3 posiciones y 12 filas; la fila "TU MEJOR MARCA EN {JUEGO}" aparece solo con sesión.
- [ ] A menos de 900px de ancho, el botón ≡ abre el panel móvil y un clic en el fondo lo cierra.
- [ ] El enlace activo del Nav se resalta: "Biblioteca" en `/`, `/juegos/*`; "Salón de la Fama" en `/salon`.
- [ ] No hay errores de hidratación ni errores en la consola del navegador en ninguna de las 5 pantallas.
- [ ] El código no contiene `React.createElement` UMD, Babel standalone ni `location.hash`.

---

## Decisiones tomadas y descartadas

- **Sí:** rutas reales del App Router. URLs compartibles y encaja con Server Components; el SPA con hash va contra el framework.
- **No:** replicar el SPA con estado en hash.
- **Sí:** reproductor con shell simulado como en la plantilla. Deja la pantalla completa para integrar los juegos reales después.
- **No:** placeholder "próximamente" ni excluir la pantalla.
- **Sí:** datos ficticios en `app/data/` (petición del usuario), con las mismas formas que tendría una consulta a base de datos.
- **Sí:** `seededScores` determinista. Evita diferencias servidor/cliente y rankings que cambian en cada recarga.
- **Sí:** sesión en `localStorage` + Context, como la plantilla. Se reemplaza por auth real más adelante.
- **No:** cookie. Obligaría a contenido dinámico o Server Actions con `cacheComponents` activo, para algo desechable.
- **Sí:** guardar puntuaciones en `localStorage` (`av_scores`) aunque no se lean. Mantiene el comportamiento de la plantilla y deja el contrato listo.
- **Sí:** Google/GitHub, términos y créditos decorativos. Son parte del diseño visual y no tienen backend.
- **Sí:** reutilizar `app/globals.css` sin reescribirlo; solo se agregan estilos si falta alguno.
- **Sí:** leer `av_user` después de montar. Evita desajustes de hidratación a costa de un parpadeo del botón de sesión.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Desajuste de hidratación por leer `localStorage` en el primer render | Estado inicial `null` y lectura en `useEffect`; el Nav renderiza "Iniciar Sesión" hasta que se monta. |
| `cacheComponents` rompe páginas con datos de `params` o `localStorage` | Leer `node_modules/next/dist/docs/` antes de escribir las rutas dinámicas; usar `generateStaticParams` en `/juegos/[id]`. |
| `localStorage` no disponible (modo privado) | Envolver lecturas y escrituras en `try/catch`, como la plantilla; la app funciona sin persistir. |
| Clases CSS de la plantilla ausentes en `globals.css` | Comparar visualmente cada pantalla con `references/templates/Arcade Vault.html` y portar los estilos faltantes. |

---

## Qué **no** está en esta spec

- Ningún juego real (ni lógica, ni canvas, ni controles).
- Backend, base de datos ni autenticación real.
- Lectura de las puntuaciones guardadas en `av_scores`.
- Créditos funcionales ni login social funcional.
- Internacionalización.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propia spec.
