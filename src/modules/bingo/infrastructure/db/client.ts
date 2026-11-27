import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import * as accountsSchema from "@/modules/accounts/infrastructure/db/schema";
import { getSql } from "@/shared/db/connection";
import * as schema from "./schema";

const createBingoDb = () => drizzle({ client: getSql(), schema: { ...schema, users: accountsSchema.users } });
export type BingoDb = ReturnType<typeof createBingoDb>;

let db: BingoDb | undefined;

/** Drizzle client for the bingo module, created on first use. */
export function getBingoDb(): BingoDb {
  db ??= createBingoDb();
  return db;
}
