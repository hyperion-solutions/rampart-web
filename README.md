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
