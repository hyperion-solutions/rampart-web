#!/usr/bin/env bash
# Vercel runs this instead of `npm run build` (the "vercel-build" script in package.json).
#
# Database migrations run on every Vercel deploy:
# - production deploys migrate the production database (Neon branch "main");
# - preview deploys migrate their own Neon branch, which the Neon integration
#   creates per deployment, so a PR's migration is proven before it reaches production.
# Local builds (no VERCEL_ENV) never migrate.
set -euo pipefail

case "${VERCEL_ENV:-}" in
  production|preview)
    echo "Vercel ${VERCEL_ENV} deploy: applying database migrations"
    npx drizzle-kit migrate
    ;;
  *)
    echo "Skipping database migrations (not a Vercel deploy)"
    ;;
esac

npx next build
