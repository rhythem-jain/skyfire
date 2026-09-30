# Contributor and AI-agent rules

- Read README.md, docs/ARCHITECTURE.md, docs/ROADMAP.md and docs/QA.md before changing systems.
- Use strict TypeScript, ES modules, camelCase functions/variables and PascalCase types/classes. Keep module names lowercase.
- Keep pure combat/save rules independent of Three.js and the DOM.
- Use the current architecture; inspect existing code before replacing any working system.
- Implement coherent, testable increments. Never label a planned feature complete.
- Run `npm test` and `npm run build` for code changes using Node.js 22.x. Run `npm run test:browser` when Chromium/Playwright is installed. Record actual results and gaps in docs/QA.md.
- Dev: `npm run dev -- --host 0.0.0.0`; production preview: `npm run preview -- --host 0.0.0.0`.
- Deployment: GitHub stores the source; Vercel uses vercel.json to run npm ci and npm run build, then serves dist/. Never commit dependencies, generated builds, test screenshots, environment files or .vercel/ state.
- Cap effects/projectiles, reuse materials, avoid unnecessary frame-loop allocations, and clamp pixel density. Profile before adding postprocessing or real-time shadows.
- Assets must be original, procedural, or explicitly licensed and attributed. Never copy a commercial game's models, sounds, missions, UI, names or logos.
- No secrets, tokens, private memory, analytics or remote services in this client-only project.
- UI text must describe working behavior. Keep locked future campaign features clearly labeled as planned.
- Save format changes need versioning, validation, safe defaults and migration tests.
- Handle resize, lost focus, storage failure and renderer errors. Do not use page reload as a normal mission reset.
- Document limitations honestly. Automated smoke testing does not establish cross-browser compatibility, audio quality or an FPS guarantee.
