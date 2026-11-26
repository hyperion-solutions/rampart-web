import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { getSql } from "@/shared/db/connection";
import * as schema from "./schema";

/** Drizzle client for the accounts module's tables. */
export const createAccountsDb = () => drizzle({ client: getSql(), schema });

export type AccountsDb = ReturnType<typeof createAccountsDb>;
