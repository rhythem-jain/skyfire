# SKYFIRE: BLACK HORIZON

**Own the sky. Change the battlefield.**

An original 3D helicopter combat game built with **Three.js, TypeScript, and Vite**. Pilot the VX–9 Kestrel through a desert strike mission, eliminate hostile armor, and bring your aircraft home.

## Features

- Third-person arcade flight with mouse and keyboard controls.
- Rapid-fire cannon, guided missiles, target locking, and countermeasures.
- Enemy return fire, damage, explosions, and synthesized audio.
- Mission scoring, star ratings, debrief, and instant retry.
- Remappable controls, graphics settings, volume, and reduced camera shake.
- Best score and settings saved locally in your browser.
- Procedural aircraft and scenery; no external game-asset downloads.

**Current release:** one playable mission, Operation Dustline, with six stationary hostile contacts. Additional missions, upgrades, and bosses are planned. Desktop keyboard/mouse play is required; touch flight is not implemented.

## Controls

| Action | Default control |
| --- | --- |
| Forward / reverse | W / S |
| Strafe left / right | A / D |
| Descend / ascend | Q / E |
| Boost | Shift |
| Aim | Mouse |
| Cannon | Left click, or J with target aim assist |
| Guided missile | Right click or K after target lock |
| Cycle target | Tab |
| Countermeasures | Space |
| Pause / resume | Escape |

Controls can be changed in **Settings**. A WebGL 2-capable desktop browser with hardware acceleration is required. If performance is low, select **LOW** graphics quality.

## Run locally

Use **Node.js 22.x** and npm. If you use nvm, run `nvm use` to select the version in `.nvmrc`.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To build and preview the production version:

```sh
npm run build
npm run preview
```

## Publish the source to GitHub

1. Open this project folder in **GitHub Desktop**. The repository root should contain `package.json`, `src/`, and `vercel.json`.
2. Create a repository here if the folder is not already a Git repository.
3. Review the changed files, commit, and choose **Publish repository**.

The `.gitignore` excludes dependencies, build output, test artifacts, environment files, and local Vercel settings. Commit `package-lock.json` so deployments install the same dependency versions. Do not upload `node_modules/` or `dist/` manually.

## Deploy the game to Vercel

1. In [Vercel](https://vercel.com/new), select **Add New → Project** and import your GitHub repository.
2. Use these settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | Vite |
   | Root directory | `./` if this folder is the repository root; otherwise the folder containing `package.json` |
   | Install command | `npm ci` |
   | Build command | `npm run build` |
   | Output directory | `dist` |
   | Node.js version | 22.x |
   | Environment variables | None required |

3. Click **Deploy**. Vercel will provide the live site URL after the build succeeds.
4. Push later changes to your configured production branch to trigger new production deployments. Other branches can generate preview deployments.

The included `vercel.json` sets the framework and build commands. This is a static, client-only game: no backend, database, API keys, or serverless functions are required. Only the generated `dist/` site is served to players.

**GitHub Pages is not needed for this setup:** GitHub stores the code; Vercel hosts the game. Repository publication alone does not create a playable website.

## Tests and documentation

```sh
npm test
npm run build
```

Browser test instructions and verification limits are in [QA](docs/QA.md). More detail: [Architecture](docs/ARCHITECTURE.md), [Game design](docs/GAME_DESIGN.md), and [Roadmap](docs/ROADMAP.md).

## Assets and privacy

Game geometry and synthesized sound are generated in source; no commercial-game assets are bundled. Third-party packages retain their respective licenses.

The game has no accounts or application analytics. Scores and settings use browser storage and are not synced between devices or domains. Hosting-provider request logging is separate from game storage.
