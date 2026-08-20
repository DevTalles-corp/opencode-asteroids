# AGENTS.md

## Proyecto

Clone de Asteroids en HTML5 Canvas puro. Sin bundler, sin dependencias externas.

**Archivos:**
- `index.html` — shell HTML, solo carga el canvas y `game.js`
- `game.js` — toda la lógica del juego
- `favicon.svg` — ícono
- `tasks-instructions.md` — registro de tareas completadas

**Comandos personalizados (`.opencode/command/`):**
- `worktree.md` — comando `/worktree` para crear worktrees
- `remove-worktree.md` — comando `/remove-worktree` para eliminar worktrees y ramas

## Ejecutar

```bash
npx serve .
```
Visitar `localhost:3000`. También funciona abriendo `index.html` directamente en el navegador.

## Arquitectura de `game.js`

El archivo está organizado en secciones marcadas con comentarios `// ── Sección ──`. Todas las clases y el estado global viven en el mismo archivo, sin módulos.

**Secciones (en orden):**

1. **Input** — `keys` y `justPressed` para teclado. `pressed(code)` retorna true solo en el frame en que se presionó.
2. **Utils** — `wrap()`, `dist()`, `rand()`, `randInt()`, `complementColor()`. El wrap es toroidal, se usa en todas las entidades.
3. **Skins** — Arreglo `SKINS` con 7 skins: CLASICA, MANTA, CRESCENT, DRAGONFLY, ORIGAMI, HAMMER, ORO. Cada una define `name`, `color`, `verts` (vértices), `nose`, `flameType`, `flameX`. Propiedades opcionales: `radius` (radio de colisión, default 12), `points` (multiplicador de puntos, default 1), `previewScale` (escala en menú/vidas, default 1). ORO es el doble de grande y da puntos x2. `currentSkinIndex` controla la selección.
4. **Bullet** — `update(dt)` y `draw()`. Tiene `ttl` y `dead`.
5. **Asteroid** — Tamaños 1-3 con arreglos `RADII`, `SPEEDS`, `POINTS`. `split()` retorna 2 asteroides más pequeños. Vértices irregulares generados al azar.
6. **PinkStar** — Asteroide especial "estrella fugaz". Hereda de `Asteroid`. Velocidad 110px/s, TTL 4-6s, forma de estrella magenta con 8 puntas y estela naranja. `split()` retorna vacío (no genera más asteroides).
7. **Ship** — `reset()` para reaparecer. Invencibilidad temporal con parpadeo. `tryShoot()` con cooldown. `applySpeed()` activa boost x2 por 5s. `applyShield()` activa escudo protector por 6s. `draw()` renderiza según la skin activa (`SKINS[currentSkinIndex]`).
8. **Particle** — Explosiones básicas, se auto-destruyen con `ttl`.
9. **FireworkParticle** — Explosiones de fuego artificial. Colores aleatorios (magenta, rosa, naranja, blanco). Mayor cantidad de partículas (25 por defecto).
10. **PowerUp** — Tres tipos:
    - `'speed'` — rayo amarillo, velocidad x2 por 5s
    - `'shield'` — hexágono azul, escudo por 6s
    - `'tripleShot'` — forma de bala roja, 3 disparos en línea por 5s
    Spawning: speed cada 8-15s, shield cada 15-25s. TTL de 8s.
11. **Estado del juego** — Variables globales: `ship`, `bullets`, `asteroids`, `particles`, `powerUps`, `score`, `lives`, `level`, `state`, `powerUpTimer`, `shieldPowerUpTimer`, `pinkStarTimer`, `pinkStarsSpawned`, `currentSkinIndex`.
12. **Update** — Loop de actualización con máquina de estados. Colisiones bala-asteroide, nave-asteroide y nave-power-up. Spawning de PinkStars controlado por `pinkStarTimer`.
13. **Draw** — Renderizado de HUD, overlays y entidades.
14. **Loop principal** — `requestAnimationFrame` con `dt` limitado a 50ms.

**Máquina de estados:**
- `menu` → selección de skin con flechas izq/der, Enter/Space para iniciar
- `playing` → juego activo
- `dead` → esperando `deadTimer` (2s) antes de reaparecer
- `gameover` → esperando `Space` para reiniciar con `initGame()`

**Funciones auxiliares:**
- `spawnAsteroids(count)` — genera asteroides evitando la zona central segura (130px)
- `initGame()` — reinicia estado completo del juego
- `nextLevel()` — avanza de nivel, limpia balas/partículas/powerups
- `explode()` — explosión básica de partículas
- `fireworkExplode()` — explosión de fuego artificial (25 partículas)
- `killShip()` — destruye la nave, aplica penalty de vida

## Convenciones

- Todo el código en `game.js`. No hay otros archivos JS ni módulos.
- Canvas rendering directo (`ctx.fillRect`, `ctx.beginPath`, etc.). No hay abstracción de rendering.
- Entidades tienen `update(dt)` y `draw()`. El `dt` viene de `requestAnimationFrame`.
- Entidades eliminadas se marcan `dead = true` y se filtran al final del frame.
- El espacio es toroidal: `wrap(valor, max)` asegura que nada sale del canvas.
- `state` controla el flujo del juego — revisar antes de agregar lógica nueva.
- Valores mágicos (velocidades, tamaños, puntos) están como constantes al inicio de cada clase, no hardcodeados en funciones.
- El HUD y overlays están en funciones separadas (`drawHUD`, `drawOverlay`).
- Las skins se definen en el arreglo `SKINS` con estructura uniforme.
- Los PowerUp se distribuyen: 65% speed, 35% tripleShot (shield se genera por separado).
