# Architecture

The repository root contains the application and deployment configuration; detailed design documents live in `docs/`. Vercel builds the root project and serves only `dist/`.

```text
src/
  main.ts                 application composition and state transitions
  style.css               responsive design system and HUD
  core/input.ts           action-oriented keyboard/pointer adapter
  core/save.ts            versioned local persistence and validation
  game/rules.ts           pure damage, scoring, mission rules
  game/game.ts            simulation, camera, renderer, combat actors
  world/models.ts         shared procedural aircraft and vehicle factories
  world/environment.ts    deterministic scenery and lighting
  world/batch.ts          static geometry batches by material
  effects/particles.ts    bounded reusable effects
  audio/audio.ts          user-activated procedural audio
  ui/ui.ts                menus, settings, HUD and debrief
tests/
  rules.test.ts           pure rules/storage unit tests
  browser.mjs             local browser smoke test
  resilience.mjs          mouse combat, defeat and fault injection
```

## Dependency direction
UI → application → simulation → rules/factories/effects/audio. Save and rules must remain importable without a DOM or GPU. The simulation never mutates menu markup directly; a snapshot/callback boundary communicates results. The app owns state transitions. The input adapter owns listeners and clears state on pause/blur.

## Ownership and lifecycle
A single WebGL renderer and one RAF loop survive menu and mission transitions. Mission reset reinitializes existing actor groups and returns particles/projectiles to reusable state. Shared actor geometry/material caches survive missions. Static parts are batched by material once, with independent roots preserved for rotors and turrets. Renderer is resized, not recreated. Audio is created only following a gesture. Mission timeout, health and objective completion are resolved in one simulation update.

## Extension seams
Replace procedural factories with licensed GLTF through the same actor interfaces. Move the current mission definition into a mission catalog before adding a second mission. Add enemy strategy objects when behavior diversity justifies them. Add progression separately from combat rules. Do not create empty managers for future systems merely to populate directories.

## Tradeoffs
Flat-shaded materials and atmospheric fog replace expensive texture pipelines/postprocessing. Cannon uses analytical ray-sphere aim checks plus cosmetic tracers, not hundreds of rigid bodies. Collision uses spheres and flight bounds, not a general physics engine. The initial slice has a small vehicle roster, not the full campaign AI.
