# Rampart web

Website for **Rampart**, an Old School RuneScape clan for 1-45 Defence ironmen. Built with Next.js and powered by [Wise Old Man](https://wiseoldman.net).

**Live site:** https://rampart-web-alpha.vercel.app

## Run it locally

Requires Node 22 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # set WOM_GROUP_ID
npm run dev
```

### Database

Postgres on Neon, connected to the Vercel project.

- **Deploys:** migrations in `drizzle/` are applied automatically on every Vercel deploy (`scripts/vercel-build.sh`). Production uses the Neon `main` branch. Each preview deploy gets its own Neon branch (created and deleted by the Neon integration), so a PR's migration runs there first.
- **Local development:** use the Neon `development` branch, never the production database. Put its connection strings in Vercel as Development-only `DATABASE_URL` and `DATABASE_URL_UNPOOLED`, then:

```bash
npx vercel login
npx vercel link                              # team hyperion, project rampart-web
npx vercel env pull .env.development.local   # writes the Development variables
npm run db:migrate                           # apply migrations to your dev branch
```

Production database values are marked sensitive in Vercel, so they can't be pulled to a laptop.

Change the schema in `src/modules/<module>/infrastructure/db/schema.ts`, then run `npm run db:generate` and commit the new file in `drizzle/`. `npm run db:studio` opens a browser view of the data.

Before opening a pull request:

```bash
npm run typecheck && npm run lint && npm run build
```

## How we work

- `main` is production. Every merge deploys to Vercel.
- Branch per change (`feat/bingo-board`, `fix/gains-limit`), open a pull request, squash-merge once CI passes.
- Every pull request gets a Vercel preview link.
- Plan work on the hyperion-solutions org's **Rampart web** project board, using issues and milestones.

## Deployment

Hosted on Vercel at https://rampart-web-alpha.vercel.app. Environment variables (`WOM_GROUP_ID`, `WOM_API_BASE_URL`, `WOM_USER_AGENT`) are set in the Vercel project settings, never committed.

## Architecture

See [AGENTS.md](AGENTS.md) for the layering rules, design tokens and conventions.
