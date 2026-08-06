# AGENTS.md

Clon de Asteroids en canvas HTML5 puro. Sin bundler, sin dependencias, sin tests.

## Estructura

- `index.html` — carga `game.js`, canvas fijo 800×600 con estilos inline
- `game.js` — toda la lógica en un solo archivo, scope global, sin módulos
- `favicon.svg` — icono

No hay `package.json`, ni config de build/lint/test. Cualquier cambio se verifica abriendo `index.html` en el navegador.

## Cómo correr

```bash
npx serve .   # luego http://localhost:3000
```

O abrir `index.html` directamente (doble clic). Cambios en `game.js` se reflejan recargando.

## Convenciones que importan al editar

- **Tamaño del canvas va sync entre `index.html` (atributos `width`/`height`) y las constantes `W`/`H` al top de `game.js`** — cambiar uno sin el otro desincroniza render y wrap.
- Input: `keys` (held) para rotación/propulsión; `pressed()` lee y limpia `justPressed` (edge-triggered) para disparo y reinicio. Usa `e.code` (teclas físicas), no `e.key`.
- Espacio toroidal: `wrap(v, max)` aplica en todas las entidades que se mueven. No agregar entidades que olviden wrap.
- `dt` viene clampado a 0.05 s máx en el loop — tuning de velocidades en px/s debe considerar ese tope.
- Entidades (`Ship`, `Asteroid`, `Bullet`, `Particle`) comparten interfaz mínima: `update(dt)`, `draw()`, flag `dead`. Filtrado por `dead` cada frame.
- Sizes de asteroide: 3 = grande, 2 = mediano, 1 = pequeño (chico). Arrays `RADII`/`SPEEDS`/`POINTS` indexados por size; índice 0 sin uso.

## tolerated drift en README

El README menciona **power-ups** y un asteroide tipo **estrella fugaz**. No existen en `game.js`. Son roadmap, no features implementadas — no asumir al editar.