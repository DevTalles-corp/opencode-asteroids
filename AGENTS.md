# Agent Instructions

## Repository

- This is a dependency-free HTML5 Canvas game; do not assume a package manager, bundler, framework, or build step exists.
- Open `index.html` in a browser to run the game, or serve the repository with `npx serve .` and visit `http://localhost:3000`.
- `game.js` is the complete application and contains the input handlers, game entities, state transitions, update loop, rendering, and animation loop.
- The canvas is fixed at `800×600`; coordinate wrapping and gameplay constants are implemented directly in `game.js`.

## Verification

- There is no automated test, lint, typecheck, or build command configured.
- Verify gameplay changes manually in a browser, including the affected controls and game-over/restart flow when relevant.
- Keep browser-console errors at zero; changes to `game.js` execute immediately when `index.html` loads.
