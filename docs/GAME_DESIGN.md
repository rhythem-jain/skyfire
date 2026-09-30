# Game design

## Identity
SKYFIRE / BLACK HORIZON. Near-future independent flight wing, charcoal aircraft with signal-orange identification panels. Warm sandstone terrain, dusty atmospheric blue distance, ivory typography, amber mission accents, mint target telemetry. Avoid commercial-game emblems and real military insignia.

## First 30 seconds
Deploy directly above a desert road. The first armor group is ahead and marked. The flight computer shows a compact control legend; no blocking tutorial. Autocannon tracers, impact sparks, hit feedback and tank smoke establish weapon power. Return fire forces lateral movement. The next target is selected automatically after a kill.

## Operation Dustline
A Directorate convoy is staged in the Saffron Reach. Destroy six combat vehicles guarding the road. Four armor vehicles and two SAM emplacements create threat variety. Finish with at least one health point. A three-minute limit prevents an endless sortie. Restart or return to the menu after the debrief. Convoy movement and route changes are a future dynamic-mission feature, not implemented in this slice.

## Flight
World-relative arcade movement with a soft forward drift while targets remain ahead. WASD controls horizontal motion; Q/E descend/ascend. Flight is bounded to the combat area and altitude band. Visual bank and pitch follow velocity, not a complex aerodynamic simulation. Chase camera uses exponential smoothing and reduced-shake support.

## Combat
Cannon is rapid fire with heat buildup and automatic cooling. Aim using the mouse; keyboard-only mode assists toward the selected hostile. A selected target locks while within acquisition range and near the aim point. Guided missiles need a completed lock, ammunition and cooldown. Space releases a limited defensive pulse that removes nearby incoming fire. Enemy tracer attacks are telegraphed, finite-speed projectiles rather than unavoidable damage ticks.

## Feedback and scoring
Target frames show class, range, health and lock progress. Hits flash and spark; low-health targets smoke. Destruction emits debris, fireball and smoke. Armor kills earn 500 points, SAM kills 1,000. Streak multipliers reward rapid kills. Completion awards survival and time bonuses. Stars distinguish completion, survival and accuracy. Local best score persists.

## Audio
Original Web Audio synthesis: layered rotor tone, cannon noise bursts, missile sweep, explosion bass/noise and UI confirm tones. No recorded voice or licensed music in the slice. Positional radio and full 3D audio are future work.

## Procedural versus placeholder
Shippable prototype geometry: aircraft, rotor animation, tanks, road, rocks, mesas, outpost, radar and vegetation. Procedural visual placeholders: cinematic smoke, terrain shading and cockpit detail. Synthesized audio is intentionally a placeholder for bespoke audio production. Future jungle/city art, pilots, cutscenes and mission voice need original or explicitly licensed assets with attribution.

## Full campaign direction (planned)
First Strike → Desert Fire → Blackout → Iron Road → SAM Hunter → Night Raid → Storm Front → Air Superiority → Fortress → Black Horizon. Introduce dynamic mission triggers gradually: radar loss releases convoy, convoy requests drones, bridge collapse reroutes armor, final gunship enters. The final antagonist is the fictional Obsidian carrier, not a copied boss.
