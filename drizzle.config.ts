import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Tooling runs outside Next.js, so load .env* files the way `next dev` does
// (including .env.development.local). On Vercel the real values are already in
// process.env, which these files never override.
loadEnvConfig(process.cwd(), true);

// Migrations use the direct (unpooled) connection; the app uses the pooled DATABASE_URL.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/*/infrastructure/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: url ?? "" },
  strict: true,
  verbose: true,
});
