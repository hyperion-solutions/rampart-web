import "server-only";
import type { ClanMembership, ClanMembershipChecker } from "../../domain/clan-membership";

const DISCORD_API = "https://discord.com/api/v10";

interface DiscordGuildMember {
  roles: string[];
}

/**
 * Adapter: reads the signed-in user's server membership and roles with their own token
 * (OAuth scope `guilds.members.read`). Discord answers 404 when they aren't in the server.
 */
export class DiscordGuildMembership implements ClanMembershipChecker {
  /**
   * @param rankRoles rank name to role id, ordered lowest to highest rank;
   *   the highest one the member holds is reported as their rank.
   */
  constructor(
    private readonly guildId: string,
    private readonly rankRoles: Readonly<Record<string, string>>,
  ) {}

  async check(discordAccessToken: string): Promise<ClanMembership> {
    const res = await fetch(`${DISCORD_API}/users/@me/guilds/${this.guildId}/member`, {
      headers: { Authorization: `Bearer ${discordAccessToken}` },
      cache: "no-store",
    });
    if (res.status === 404) return { status: "not-in-server" };
    if (!res.ok) throw new Error(`Discord membership check failed (${res.status}) for server ${this.guildId}`);

    const { roles } = (await res.json()) as DiscordGuildMember;
    const held = new Set(roles);
    const rank = Object.entries(this.rankRoles)
      .filter(([, roleId]) => held.has(roleId))
      .map(([name]) => name)
      .at(-1);
    return rank ? { status: "ranked", rank } : { status: "no-rank" };
  }
}
