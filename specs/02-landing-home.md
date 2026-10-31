# SPEC 02 — Landing page (Inicio) y Biblioteca en `/juegos`

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-31
> **Objective:** Crear la landing page de `references/home-about/` en `/`, mover la Biblioteca actual a `/juegos` y completar el Nav con Inicio, Biblioteca, Salón de la Fama y Acerca de (sin acción).

---

## Por qué existe esta spec

En la SPEC 01 la Biblioteca ocupa `/`. La referencia `references/home-about/` separa dos pantallas: una landing (`Home`) y la Biblioteca. Esta spec porta la landing y reubica la Biblioteca. `references/home-about/styles.css` trae los estilos `home-*`, `feature-*`, `mini-*`, `stat-*`, `activity-*`, `pricing-*`, etc., que todavía no existen en `app/globals.css`.

---

## Alcance

**Dentro:**

- Nueva landing en `/` portada de `references/home-about/home.jsx`, con las siete secciones:
  - Hero: eyebrow "INSERTA UNA MONEDA", título de tres líneas, subtítulo, CTAs, indicador "DESLIZA" y 8 siluetas SVG flotantes.
  - `// 01` ¿POR QUÉ ARCADE VAULT?: 4 `feature-card` con iconos pixel (GAMEPAD, FREE, TROPHY, ROCKET).
  - `// 02` JUEGOS DISPONIBLES AHORA: riel de 6 `mini-card` (los 6 primeros de `GAMES`) y botón "VER TODOS LOS JUEGOS →".
  - Bloque de estadísticas: "12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING".
  - `// 03` ACTIVIDAD EN VIVO: "ÚLTIMAS PUNTUACIONES" (7 filas) y "TOP JUGADORES · HOY" (5 filas) con enlace "VER SALÓN →".
  - `// 04` PRECIOS: tarjeta "JUGADOR VAULT $0 / SIEMPRE" y 3 preguntas frecuentes.
  - CTA final "¿LISTO PARA JUGAR?" con "INSERTAR MONEDA →".
- Animación de aparición `reveal` al hacer scroll (`IntersectionObserver`) en un Client Component pequeño.
- La Biblioteca actual (hero `av-hero`, buscador, chips, grilla) pasa de `/` a `/juegos`, sin cambios de contenido.
- Nav con cuatro enlaces, en este orden: Inicio (`/`), Biblioteca (`/juegos`), Salón de la Fama (`/salon`) y Acerca de. Aplica al Nav de escritorio y al panel móvil.
- "Acerca de" se muestra con la misma apariencia que los otros enlaces, sin `href` y sin ninguna acción al hacer clic.
- Estado activo del Nav: "Inicio" solo en `/`; "Biblioteca" en `/juegos` y `/juegos/*`.
- Enlaces internos que hoy apuntan a `/` con sentido de "volver a la biblioteca" pasan a `/juegos`: "VOLVER AL VAULT" del Detalle y del reproductor, y "VOLVER A LA BIBLIOTECA" del Salón.
- Datos ficticios de actividad (últimas puntuaciones y top de hoy) en `app/data/activity.ts`, tipados.
- Estilos portados de `references/home-about/styles.css` a `app/globals.css`: solo los de la landing (`home-*`, `hero-*`, `silo`, `feature-*`, `mini-*`, `stat-*`, `activity-*`, `ac-*`, `tick-*`, `tk-*`, `top-*`, `tp-*`, `pricing-*`, `price-*`, `pc-*`, `faq-*`, `final-*`, `section-*`, `kicker`, `reveal`, `lb-link`) y sus `@keyframes` (`bounce`, `float`) y media queries.

**Fuera de alcance (para otras specs):**

- Pantalla "Acerca de" (`about.jsx`) y cualquier ruta `/acerca`. El enlace queda inerte.
- Estilos de `about` (`highlight-row`, `contact-grid`, etc.).
- Actividad en vivo real: los datos son fijos, sin tiempo real ni backend.
- Leer las puntuaciones de `av_scores`.
- Redirigir tras iniciar sesión o entrar como invitado a una ruta distinta de `/`.
- Contador de créditos funcional.
- Tests automatizados.

---

## Modelo de datos

```ts
// app/data/activity.ts
export type NeonColor = "cyan" | "magenta" | "yellow" | "green";

export interface RecentScore {
  player: string;        // "NEONFOX"
  game: string;          // "Caída" (texto libre, no id)
  score: number;         // 184220
  ago: string;           // "hace 2 min"
  color: NeonColor;
}

export interface TopPlayer {
  rank: number;          // 1..5
  player: string;
  score: number;
}

export const RECENT_SCORES: RecentScore[]; // 7 filas, copiadas de home.jsx
export const TOP_TODAY: TopPlayer[];       // 5 filas, copiadas de home.jsx
```

Convenciones:

- Se reutilizan `GAMES` y `getGame` de `app/data/games.ts` sin modificarlos.
- Los números se formatean con `toLocaleString("es-ES")`.
- Los textos de la landing se copian tal cual de `home.jsx`.
- La landing es Server Component. Solo el observer de `reveal` y las partes con estado van en Client Components.

---

## Plan de implementación

1. Portar a `app/globals.css` los estilos de la landing y sus `@keyframes` desde `references/home-about/styles.css`. Verificación: `npm run build` sin errores; las pantallas existentes se ven igual.
2. Crear `app/data/activity.ts` con `RECENT_SCORES` y `TOP_TODAY`. Verificación: `npx tsc --noEmit` sin errores.
3. Mover la Biblioteca: crear `app/juegos/page.tsx` con el contenido actual de `app/page.tsx` (hero, `Library`). Verificación: `/juegos` se ve y filtra igual que antes `/`.
4. Actualizar `app/components/nav.tsx`: agregar Inicio y Acerca de, apuntar Biblioteca a `/juegos`, ajustar el estado activo. Verificación: los cuatro enlaces aparecen en escritorio y en el panel móvil, y "Acerca de" no navega.
5. Actualizar los enlaces a biblioteca en `app/juegos/[id]/page.tsx`, `app/components/game-player.tsx` y `app/components/hall-of-fame.tsx` para que apunten a `/juegos`. Verificación: los tres botones llevan a `/juegos`.
6. Crear `app/components/reveal-observer.tsx` (Client Component que añade la clase `in` a los `.reveal` visibles) y `app/components/home-silhouettes.tsx` (las 8 siluetas SVG). Sin consumidores todavía.
7. Reemplazar `app/page.tsx` por la landing: hero con siluetas, secciones 01 a 04, estadísticas y CTA final; crear `app/components/feature-icon.tsx` y `app/components/mini-card.tsx`. Verificación: `/` muestra las siete secciones y los CTAs navegan a `/juegos`, `/auth`, `/salon` y `/juegos/[id]`.

---

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npx tsc --noEmit` termina sin errores.
- [ ] `npm run build` termina sin errores.
- [ ] `/` y `/juegos` responden 200 en `npm run dev`.
- [ ] `/` muestra el hero con el título "EL ARCADE CLÁSICO ESTÁ DE VUELTA" y las 8 siluetas.
- [ ] `/` muestra las secciones `// 01`, `// 02`, `// 03` y `// 04`, el bloque de estadísticas y el CTA "¿LISTO PARA JUGAR?".
- [ ] La sección `// 01` tiene 4 tarjetas: JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS y SIEMPRE CRECIENDO.
- [ ] La sección `// 02` muestra exactamente los 6 primeros juegos de `GAMES`, y hacer clic en uno navega a `/juegos/[id]`.
- [ ] "ÚLTIMAS PUNTUACIONES" muestra 7 filas y "TOP JUGADORES · HOY" muestra 5.
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" navegan a `/juegos`.
- [ ] "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/auth`.
- [ ] "VER SALÓN →" navega a `/salon`.
- [ ] Las secciones con `reveal` aparecen (clase `in`) al entrar en el viewport.
- [ ] `/juegos` muestra el mismo hero, buscador, chips y grilla de 8 tarjetas que mostraba `/` en la SPEC 01.
- [ ] En `/juegos`, el chip SHOOTER muestra exactamente INVASORES y ROCAS, y una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] El Nav muestra, en este orden: Inicio, Biblioteca, Salón de la Fama y Acerca de, y el panel móvil muestra los mismos cuatro enlaces.
- [ ] Hacer clic en "Acerca de" no cambia la URL ni abre ninguna página.
- [ ] "Inicio" está activo solo en `/`; "Biblioteca" está activo en `/juegos` y `/juegos/bloque-buster`; "Salón de la Fama" está activo en `/salon`.
- [ ] Hacer clic en el logo lleva a `/`.
- [ ] "VOLVER AL VAULT" del Detalle y del reproductor y "VOLVER A LA BIBLIOTECA" del Salón llevan a `/juegos`.
- [ ] Iniciar sesión o "JUGAR COMO INVITADO" sigue redirigiendo a `/`.
- [ ] A menos de 980px las tarjetas de la sección `// 01` pasan a 2 columnas; a menos de 520px, a 1.
- [ ] A menos de 1100px el riel `// 02` pasa a 3 columnas; a menos de 600px, a 2.
- [ ] A menos de 900px las tarjetas de actividad y de precios pasan a 1 columna.
- [ ] No hay errores de hidratación ni errores en la consola del navegador en `/` ni en `/juegos`.
- [ ] El código nuevo no contiene `React.createElement` UMD, Babel standalone ni `location.hash`.

---

## Decisiones tomadas y descartadas

- **Sí:** landing en `/` y Biblioteca en `/juegos`. Es la estructura de la referencia (Inicio y Biblioteca separados) y deja la raíz como puerta de entrada.
- **No:** dejar la Biblioteca en `/` y poner la landing en otra ruta. La página principal debe ser la raíz.
- **Sí:** "Acerca de" visible pero inerte, sin `href`. Reserva el lugar en el Nav sin implementar la pantalla; el enlace se activa cuando exista su spec.
- **No:** deshabilitarlo visualmente ni ocultarlo. Se pidió que se vea como un enlace más.
- **Sí:** implementar todas las secciones de `home.jsx`. Petición explícita del usuario.
- **Sí:** `reveal` con `IntersectionObserver`. Mantiene la animación de la referencia con un único Client Component pequeño.
- **Sí:** landing como Server Component, con Client Components solo donde hay efectos. Reduce JS en cliente y encaja con `cacheComponents`.
- **Sí:** copiar los estilos de la landing a `app/globals.css`. Es la convención de la SPEC 01 (un solo archivo de estilos).
- **No:** copiar los estilos de `about`. Quedan para su propia spec.
- **Sí:** datos de actividad en `app/data/activity.ts`, no inline. Misma convención que `games.ts` y `scores.ts`, y listos para sustituirse por una base de datos.
- **Sí:** "VOLVER AL VAULT" y "VOLVER A LA BIBLIOTECA" apuntan a `/juegos`. Su intención es volver a la grilla de juegos.
- **Sí:** el login y el modo invitado siguen redirigiendo a `/`. No se pidió cambiarlo.
- **Sí:** "Biblioteca" activo en `/juegos/*`, igual que antes. El Detalle y el reproductor pertenecen a la Biblioteca.

---

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| Conflicto de nombres de clases CSS al pegar los estilos de la landing en `globals.css` | Antes de copiar, buscar cada selector (`.section-title`, `.kicker`, `.btn.pulse`, etc.) y no duplicar los ya existentes. |
| `.reveal` deja las secciones invisibles si el observer no se ejecuta (JS desactivado o falla la hidratación) | El observer se monta en `useEffect`; la landing queda visible al desplazarse una vez hidratada. Revisar la consola en `/`. |
| `cacheComponents` con la landing estática | Solo usa datos estáticos importados; leer `node_modules/next/dist/docs/` antes de escribir `app/page.tsx` y `app/juegos/page.tsx`. |
| Enlaces olvidados a `/` con sentido de "biblioteca" | Revisar con `grep` los `href="/"` y `router.push("/")` tras el paso 5 y dejar solo el logo y la redirección de auth. |

---

## Qué **no** está en esta spec

- La pantalla "Acerca de" ni su ruta; el enlace del Nav queda sin acción.
- Actividad en vivo real, backend o base de datos.
- Lectura de `av_scores`.
- Créditos funcionales.
- Cambios al contenido de la Biblioteca, el Detalle, el Salón, `/auth` o el reproductor, salvo los destinos de enlace listados.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propia spec.
