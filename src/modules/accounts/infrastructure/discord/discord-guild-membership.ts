import "server-only";
import type { ClanMembershipChecker } from "../../domain/clan-membership";

const DISCORD_API = "https://discord.com/api/v10";

/**
 * Adapter: checks membership with the signed-in user's token
 * (OAuth scope `guilds.members.read`). Discord answers 404 when they aren't in the server.
 */
export class DiscordGuildMembership implements ClanMembershipChecker {
  constructor(private readonly guildId: string) {}

  async isMember(discordAccessToken: string): Promise<boolean> {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds/${this.guildId}/member`, {
      headers: { Authorization: `Bearer ${discordAccessToken}` },
      cache: "no-store",
    });
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`Discord membership check failed (${res.status}) for server ${this.guildId}`);
    return true;
  }
}
