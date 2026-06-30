# Contributing

Thanks for helping improve the Hardware Shop frontend!

## Getting set up

1. Fork and clone the repository.
2. Install Node.js 20+ and run `npm install`.
3. Start the backend API (defaults to `http://localhost:8080`).
4. Run `npm start` and open `http://localhost:4200`.

## Development guidelines

Follow the conventions in `AGENTS.md`:

- Standalone components (no NgModules); do not set `standalone: true` explicitly.
- Use signals and `computed()` for state; `inject()` over constructor injection where natural.
- Native control flow (`@if`, `@for`, `@switch`) — not the legacy structural directives.
- Reactive forms; `OnPush` change detection; strict TypeScript (avoid `any`).
- Keep API access in `services/` and read the base URL from `environment`.
- Meet WCAG AA and keep the UI accessible.

## Workflow

- Branch: `git checkout -b feat/short-description`.
- Format with Prettier before committing.
- Build before pushing: `npm run build`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`...).

## Pull requests

Keep PRs focused, describe the change, and include screenshots for UI work.
