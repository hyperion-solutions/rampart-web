import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env } from "@/shared/config/env";

let sql: NeonQueryFunction<false, false> | undefined;

/**
 * Shared Neon HTTP connection. Created on first use so pages that don't touch
 * the database (and builds without DATABASE_URL) never need it.
 * Modules wrap it with Drizzle and their own schema in their infrastructure layer.
 */
export function getSql(): NeonQueryFunction<false, false> {
  sql ??= neon(env.databaseUrl);
  return sql;
}
