// Runs the item catalog import against a running dev server (npm run dev).
// Usage: npm run items:import            (defaults to http://localhost:3000)
//        BASE_URL=http://localhost:3001 npm run items:import
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), true);
const base = process.env.BASE_URL ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("CRON_SECRET is missing. Run: npx vercel env pull .env.development.local");
  process.exit(1);
}

const res = await fetch(`${base}/api/cron/import-items`, { headers: { Authorization: `Bearer ${secret}` } });
const body = await res.text();
console.log(res.status, body);
process.exit(res.ok ? 0 : 1);
