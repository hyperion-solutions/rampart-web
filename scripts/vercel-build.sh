#!/usr/bin/env bash
# Vercel runs this instead of `npm run build` (the "vercel-build" script in package.json).
# Database migrations run only for production deploys: preview deploys share the
# production database, so unmerged schema changes must never be applied from a preview.
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "Production deploy: applying database migrations"
  npx drizzle-kit migrate
else
  echo "Skipping database migrations (VERCEL_ENV=${VERCEL_ENV:-unset})"
fi

npx next build
