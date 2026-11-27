import "server-only";
import { GetClanRoster } from "@/modules/clan/application/get-clan-roster";
import { GetClanOverview } from "@/modules/clan/application/get-clan-overview";
import { GetTopGainers } from "@/modules/clan/application/get-top-gainers";
import { WomClanRepository } from "@/modules/clan/infrastructure/wiseoldman/wom-clan-repository";
import { WomClient } from "@/modules/clan/infrastructure/wiseoldman/wom-client";
import { CheckClanMembership } from "@/modules/accounts/application/check-clan-membership";
import { SignInWithDiscord } from "@/modules/accounts/application/sign-in-with-discord";
import { getAccountsDb } from "@/modules/accounts/infrastructure/db/client";
import { DrizzleUserRepository } from "@/modules/accounts/infrastructure/db/drizzle-user-repository";
import { DiscordGuildMembership } from "@/modules/accounts/infrastructure/discord/discord-guild-membership";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";

/** Composition root: the ONLY place concrete classes are wired to ports. */
export function createContainer() {
  const client = new WomClient({ baseUrl: env.womBaseUrl, userAgent: env.womUserAgent });
  const clanRepository = new WomClanRepository(client, env.womGroupId);
  const clanMembership = new DiscordGuildMembership(site.discordGuildId, site.clanRankRoles);
  return {
    getClanOverview: new GetClanOverview(clanRepository),
    getTopGainers: new GetTopGainers(clanRepository),
    getClanRoster: new GetClanRoster(clanRepository),
    signInWithDiscord: new SignInWithDiscord(clanMembership, new DrizzleUserRepository(getAccountsDb)),
    checkClanMembership: new CheckClanMembership(clanMembership),
  };
}
export const container = createContainer();
