# Technical requirements

## Stack
Vite + strict TypeScript + Three.js. DOM/CSS UI with no UI framework. Node built-in test runner through tsx. Build emits static assets to dist/.

## Runtime budgets
Cap delta time to 33 ms; use time-based movement. Clamp renderer DPR by quality tier. Share geometry/materials, instance decorative objects, pool transient effects, limit simultaneous projectiles. One directional sun; no dynamic shadow maps in the first slice. Fog and flat-shaded geometry provide depth at low cost. Target 60 FPS but measure on actual target hardware before claiming it.

## Systems
- Application state: MENU, MISSION, PAUSED, COMPLETE, FAILED, SETTINGS.
- Input adapter: configurable bindings, pointer normalized coordinates, held actions and edge-triggered actions.
- World: seeded procedural environment and reusable actor factories.
- Combat: frame-independent movement, cooldowns, aim acquisition, ray-to-target cannon checks, guided projectile motion, distance-based AI, radial explosion feedback.
- UI: HTML overlay; HUD throttled where practical; DOM text uses textContent for dynamic data.
- Effects: bounded reusable particle pool and shared materials.
- Audio: lazily-created Web Audio graph, rotor oscillators and synthesized one-shots; master volume and pause behavior.
- Save: schema version, finite numeric validation, safe defaults, try/catch around storage access.

## Resilience
Catch renderer initialization failure; explain WebGL requirement. On context loss, stop combat and offer reload. Resize camera and renderer. Blur and hidden-tab events pause the mission and release held controls. No external textures, fonts, services, secrets, or runtime CDN requests.

## Testing
Pure rule tests cover damage, scoring, missile gating, mission completion, and save validation. A headless browser smoke script checks menu, deploy, settings, pause, game rendering, and a combat/debrief path. GPU performance, audio perception and browser compatibility require manual testing.
