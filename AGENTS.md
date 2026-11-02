# AGENTS.md

Vanilla HTML5 Canvas Asteroids clone. No build, bundler, dependencies, tests, lint, or CI.

## Run

- Open `index.html` directly, or `npx serve .` and visit the printed URL.
- No hot reload: reload the browser after editing.
- There is no automated verification; test changes manually in the browser.

## Structure

- `index.html` — canvas (`800x600`) + `<script src="game.js">`; no modules.
- `game.js` — the entire game in one global-scope file.
- `README.md` — Spanish docs. UI strings are Spanish (`NIVEL`, `PUNTAJE`, `GAME OVER`); match that when adding text.

## Game code conventions

- Keep `canvas.width/height` in `index.html` in sync with `W`/`H` in `game.js:5`.
- Classes: `Bullet`, `Asteroid`, `ShootingStar`, `Ship`, `Particle`, `SpeedPowerUp`. Game state is module-level globals (`ship`, `bullets`, `asteroids`, `particles`, `powerups`, `speedTimer`, `shootingStarTimer`) reset by `initGame()`.
- State machine: `state` is `'playing' | 'dead' | 'gameover'`; main loop is `loop()` -> `update(dt)` -> `draw()` via `requestAnimationFrame`.
- Physics is dt-based; `dt` is clamped to `0.05` to survive tab switches in `loop()`.
- World is toroidal; wrap positions with `wrap()`, never clamp at edges.
- Asteroid tiers are indexed 1/2/3 across `RADII`/`SPEEDS`/`POINTS`; `split()` drops one tier and returns two children.
- Speed power-ups drop from destroyed asteroids at `SPEED_POWERUP_DROP_CHANCE`; pickup sets `speedTimer`, which doubles `Ship` thrust while positive. Effect is cleared on death and level change.
- `ShootingStar` spawns from a random edge every 12–18 s, only one at a time, lives 5–8 s, awards 150 points, never splits, and does not block level completion. Its `draw()` overrides the asteroid look with a trail/fade.
- Input uses `e.code` and a consumed-once `pressed(code)` helper for one-shot actions; continuous input reads `keys[...]`.
- No top-level `await`/ES modules: the script runs immediately and calls `initGame()` on load.
