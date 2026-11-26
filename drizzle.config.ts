import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Tooling runs outside Next.js, so load .env* files the same way Next does.
loadEnvConfig(process.cwd());

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
