import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { getSql } from "@/shared/db/connection";
import * as schema from "./schema";

const createAccountsDb = () => drizzle({ client: getSql(), schema });
export type AccountsDb = ReturnType<typeof createAccountsDb>;

let db: AccountsDb | undefined;

/** Drizzle client for the accounts module, created on first use. */
export function getAccountsDb(): AccountsDb {
  db ??= createAccountsDb();
  return db;
}
