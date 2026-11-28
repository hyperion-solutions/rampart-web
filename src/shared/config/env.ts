function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.local, or run "vercel env pull .env.development.local"`);
  return value;
}

export const env = {
  get womGroupId() { return Number(required("WOM_GROUP_ID")); },
  womBaseUrl: process.env.WOM_API_BASE_URL ?? "https://api.wiseoldman.net/v2",
  womUserAgent: process.env.WOM_USER_AGENT ?? "rampart-web",
  /** Pooled Postgres connection string, set by the Neon integration on Vercel. */
  get databaseUrl() { return required("DATABASE_URL"); },
  /** Auth.js: signs session cookies. Same value in Production and Preview (see README). */
  get authSecret() { return required("AUTH_SECRET"); },
  get authDiscordId() { return required("AUTH_DISCORD_ID"); },
  get authDiscordSecret() { return required("AUTH_DISCORD_SECRET"); },
  /** Protects scheduled jobs (Vercel Cron sends it as a Bearer token). */
  get cronSecret() { return required("CRON_SECRET"); },
  /**
   * Vercel Blob store for drop screenshots (docs/decisions/0005). Set when the store is connected;
   * the SDK authenticates with the function's Vercel OIDC token. Unset: screenshots are not stored.
   */
  blobStoreId: process.env.BLOB_STORE_ID,
  /** Preview deploys only: production auth URL that relays Discord sign-ins back to the preview. */
  authRedirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
};
