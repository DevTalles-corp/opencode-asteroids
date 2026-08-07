# AGENTS.md

Clon de Asteroids en canvas HTML5 puro. Sin frameworks, sin bundler, sin dependencias.

## Correr / verificar

- No hay build, test ni lint. Abre `index.html` en el navegador, o corre `npx serve .` y visita `http://localhost:3000`.
- Para probar un cambio: recarga la página y juega; no hay forma automatizada de verificar.

## Layout del código

- `game.js` — TODO el juego, un solo archivo (clases `Bullet`, `Asteroid`, `Ship`, `Particle` + funciones de init/hud/loop).
- `index.html` — canvas fijo de `800x600` (`W`/`H` en `game.js`). El espacio es toroidal: usa `wrap()` en `game.js:27` para envolvimiento, no dejes que entidades salgan del lienzo.
- `favicon.svg` — icono de la página.

## Convenciones

- Identificadores en inglés; comentarios en español y solo cuando aportan valor.
- Loop de juego con `requestAnimationFrame`, `dt` limitado a `0.05s` (`game.js:415`).
- El input se propaga a `preventDefault` para `Space`/flechas; no romper ese manejo o la página scrollea al jugar.

## Gotchas

- `game.js` no está enmascarado en un IIFE: define variables globales (`canvas`, `ctx`, `W`, `H`). No colisiones de nombres de nivel global.
- La dificultad escala por nivel (`nextLevel`, `game.js:268`); los asteroides se parten como fragmentos más pequeños al destruirse.