import "server-only";
import { createHash, randomBytes } from "node:crypto";

/** 32 random bytes, URL-safe: the secret part of a member's Dink link. */
export const generateLinkSecret = () => randomBytes(32).toString("base64url");

/** Only this hash is stored, so a database leak doesn't reveal working links. */
export const hashLinkSecret = (secret: string) => createHash("sha256").update(secret).digest("hex");
