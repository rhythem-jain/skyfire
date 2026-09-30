# Product requirements

## Vision
An immediately readable, cinematic arcade helicopter combat experience: fly, acquire, fire, evade, finish, replay. New IP: SKYFIRE: BLACK HORIZON. Player aircraft: VX-9 Kestrel. Opposition: the Ashen Directorate.

## Audience and platform
Desktop players using a modern WebGL2-capable browser and keyboard/mouse. Responsive menus support smaller windows, but touch flight is outside this milestone.

## MVP / vertical slice
- One intentionally authored desert mission, Operation Dustline.
- Original procedural helicopter, tanks, SAMs, canyon, road, and outpost.
- Smooth third-person arcade flight, mouse and keyboard-only aiming.
- Cannon, missile acquisition/cooldown, enemy attacks, health and defeat.
- Damage feedback, pooled explosions, synthesized sound, score, win/retry flow.
- Cohesive menu, mission briefing, pause, settings, HUD, and debrief.
- Local versioned settings and best score; recover from corrupt storage.

## Acceptance
A player can deploy within one click, see and engage enemies within 10 seconds, finish or fail a mission, retry without reloading, and change settings. Pausing and tab switching must suspend combat. A production build and automated rule tests must pass. Manual cross-browser/hardware QA remains a separate release gate.

## Future scope
Ten missions, diverse biomes, garage upgrades, XP economy, bosses, expanded weapons, touch/controller input, dynamic battlefield scripts, and adaptive quality. Do not depict locked campaign cards as implemented missions.

## Non-goals
Full flight simulation, multiplayer, real-world military accuracy, copied commercial assets, AAA production equivalence, paid progression, backend services or secrets.

## Risks
Procedural art requires disciplined composition; performance varies by GPU; browser audio requires user activation; accessibility and device coverage require human testing.
