# AGENTS.md

Guidance for AI coding agents (and humans) working on **rampart-web**, the website for the Rampart Old School RuneScape clan.

## Stack
Next.js (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4. Data comes from the Wise Old Man (WOM) API v2.

## Commands
- `npm run dev` start dev server
- `npm run typecheck` and `npm run lint` must pass before finishing a task
- `npm run build` verify production build for larger changes

## Architecture (DDD, modular, layered)
Organised by feature module, then by layer:

    src/
      app/            Next.js routes only: compose UI, call use cases. No business logic.
        _components/    Feature UI shared by several routes (e.g. member icons). Route-only UI goes in <route>/_components/.
      composition/    Composition root (DI). The only place concrete classes are wired up.
      modules/<name>/
        domain/          Entities, value types, repository interfaces (ports). No framework or HTTP imports.
        application/     Use cases (one class each, one public `execute`). Depend on ports only.
        infrastructure/  Adapters: API clients, mappers, repository implementations.
      shared/         Cross-cutting: config, ui primitives, pure helpers.

Dependency rule: app -> application -> domain, and infrastructure -> domain. Domain never imports from outer layers.

## Rules
1. Pages never call `fetch` or WOM directly. Call a use case from `container`.
2. Never expose raw API types (`wom-types.ts`) outside `infrastructure/`. Map to domain types in a mapper.
3. New data source or feature = new port + adapter, not edits to existing classes (Open/Closed).
4. Constructor injection; depend on interfaces (Dependency Inversion).
5. One reason to change per file (Single Responsibility): client = HTTP, mapper = shape conversion, repository = orchestration, use case = intent.
6. Keep ports small and focused (Interface Segregation). Split a repository rather than growing it.
7. Server Components by default. Add `"use client"` only for interactivity, in small components.
8. Read env vars only through `shared/config/env.ts`.
9. Strict TypeScript: no `any`, no non-null `!` without a comment. Prefer `readonly` on domain types.
10. Use the `@/` import alias. No relative imports that climb out of a layer.
11. Infrastructure throws descriptive errors; `app/error.tsx` tells users what to do next.
12. UI copy: plain, sentence case, active verbs.

## Adding a feature (example: clan events)
1. Create `src/modules/events/{domain,application,infrastructure}`.
2. Define the entity and `EventRepository` port in `domain/`.
3. Write use cases in `application/`.
4. Implement the adapter in `infrastructure/`.
5. Wire it in `composition/container.ts`.
6. Add a route under `src/app/events/`.

## Design tokens
The look is 8-bit, like the OSRS interface: pixel fonts, hard 2px text shadows, notched pixel borders. The only soft effect is the blue glow behind the hero crest.
Colours are defined in `src/app/globals.css` (`@theme`), taken from the clan crest: obsidian, keep, granite, mortar, steel, limestone, rune, lightning, banner, brass, gain. Use tokens, not raw hex.
Fonts are the OSRS bitmap fonts in `src/shared/fonts/` (loaded once via `next/font/local`, exported from `index.ts`):
- `font-body` RuneScape Plain 12: paragraphs.
- `font-pixel` RuneScape Bold 12: labels, buttons, stats, player names.
- `font-quill` RuneScape Quill 8: headings and the wordmark.
Only use `text-pixel` (16px), `text-pixel-2x` (32px) and `text-pixel-3x` (48px); other sizes blur bitmap fonts.
Utilities: `.pixel-box` (notched, bevelled panel), `.pixel-btn` (button that presses in), `.text-shadow-pixel`, `.storm` (glow behind the crest), `.crest` (blends the crest's black background into the page). Use the full-quality crest `public/brand/rampart-crest.webp`; don't pixelate it.

## Out of scope for now
Automated tests, authentication, Discord bot integration.
