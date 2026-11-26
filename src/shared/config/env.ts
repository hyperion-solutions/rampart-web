function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.local`);
  return value;
}

export const env = {
  get womGroupId() { return Number(required("WOM_GROUP_ID")); },
  womBaseUrl: process.env.WOM_API_BASE_URL ?? "https://api.wiseoldman.net/v2",
  womUserAgent: process.env.WOM_USER_AGENT ?? "rampart-web",
};
