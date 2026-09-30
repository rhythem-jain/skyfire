# QA plan and evidence

## Running browser checks

Run from the repository root with Node.js 22.x. Start `npm run dev` in one terminal, then run in another:

```sh
npx playwright install chromium
npm run test:browser
npm run test:resilience
```

Both scripts default to `http://localhost:5173`. To test built assets, run `npm run build` and `npm run preview -- --port 5174`, then set `SKYFIRE_URL=http://localhost:5174` when invoking the scripts. They use an isolated Chromium profile and software WebGL; they do not access a personal browser profile. Screenshots go into the ignored `test-results/` directory. Add `?debug=1` to the game URL for performance counters.

## Automated gates
- TypeScript type checking and Vite production build.
- Unit tests for health/damage, scoring/combos, missile availability, mission resolution and corrupt/versioned saves.
- Browser smoke: load menu, deploy, render canvas, move, fire, pause/resume, settings persistence, debrief/retry and no uncaught page errors.

## Manual acceptance checklist
- [ ] First target is obvious within 10 seconds; flight and aiming feel responsive.
- [ ] Complete a sortie with mouse and keyboard.
- [ ] Complete a sortie with keyboard only.
- [ ] Cannon heat and missile lock are readable and accurate.
- [ ] Incoming attacks can be evaded; defeat and victory routes work.
- [ ] Sound starts after gesture, stops on pause, and respects volume.
- [ ] No stuck keys after focus loss; resizing preserves aspect/HUD layout.
- [ ] WebGL failure and context-loss messages are useful.
- [ ] Settings/best score survive refresh and malformed saves recover.
- [ ] Chrome, Edge and Firefox on representative real GPUs.
- [ ] Profile low/medium/high/ultra; target stable 60 FPS with graceful lower-quality play.

## Results — 2026-09-30

Environment: Linux, Node 18.19.1, TypeScript 5.7, Vite 6.4.3, Playwright 1.51.1, Chromium 134 using SwiftShader (software WebGL). These results are not real-hardware benchmark certification.

| Gate | Actual result |
| --- | --- |
| `npm test` | PASS: 9 tests, 0 failures |
| `npm run build` | PASS: strict type check and production bundle; no chunk warning after engine/app split |
| `npm run test:browser` against dev | PASS: menu, persisted settings and remapped fire key, deploy, altitude movement, pause/time freeze/resume, lock, missile ammo consumption, flare consumption, all six kills, victory/debrief, retry reset, narrow menu |
| `SKYFIRE_URL=http://localhost:5174 npm run test:browser` | PASS: same end-to-end flow against the built production assets |
| `npm run test:resilience` | PASS: remap cancellation, live mouse-aim cannon kill, synthetic blur pause, defeat from actual enemy fire (not injected health), best-score persistence, synthetic WebGL context loss, corrupt-save recovery |
| JavaScript page errors | None in either browser test |
| Screenshot inspection | Menu, active combat, settings, victory, and 390×844 menu inspected; controls and labels present and unclipped in those captures |

The first browser run used a wall-clock delay that was too short for missile lock on software rendering. The test now waits for the visible lock state. Menu aircraft framing was corrected after screenshot inspection. Static batching reduced the sampled active-scene draw calls from 367 to 76, at roughly 30,200 visible triangles. The final test sampled 43 FPS at 1440×900 on SwiftShader; this is one debug-counter sample, not an average, target-GPU benchmark or 60 FPS claim. Screenshots and software rendering can stall the headless browser; simulation deltas are deliberately capped.

Production payload: application JS 53.56 kB (18.74 kB gzip), Three.js engine 480.70 kB (120.86 kB gzip), CSS 27.22 kB (6.97 kB gzip). No external art/font/audio fetches.

Evidence (regenerated, ignored by git):
- `test-results/menu.png`
- `test-results/combat.png`
- `test-results/settings.png`
- `test-results/debrief.png`
- `test-results/menu-mobile.png`
- `test-results/defeat.png`
- `test-results/context-loss.png`

## Remaining release gates
The manual checklist above remains human QA, not replaced by automated success. In particular: subjective flight/aim feel, audio perception, color/contrast/accessibility review, touch/controller design, Firefox/Edge compatibility, sustained hardware frame-time/memory profiling, and a full mouse-only-aim mission are not certified. The automated mouse test verifies one live kill; the complete automated sortie uses keyboard targeting assistance.

## Known scope limits
One desert mission; no economy, upgrade garage, full campaign, boss, full collision physics, touch/controller support, real-time shadows, volumetric rendering or recorded audio. Menu preview is not a separate garage system. Quality tiers cap pixel density and effects; they do not pretend to toggle nonexistent postprocessing.
