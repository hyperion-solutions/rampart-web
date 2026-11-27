import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { getSql } from "@/shared/db/connection";
import * as schema from "./schema";

const createItemsDb = () => drizzle({ client: getSql(), schema });
export type ItemsDb = ReturnType<typeof createItemsDb>;

let db: ItemsDb | undefined;

/** Drizzle client for the items module, created on first use. */
export function getItemsDb(): ItemsDb {
  db ??= createItemsDb();
  return db;
}
