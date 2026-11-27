import type { ClanMembership, ClanMembershipChecker } from "../domain/clan-membership";

/** Re-checks a signed-in member's rank, so losing it (or leaving the server) ends their session. */
export class CheckClanMembership {
  constructor(private readonly membership: ClanMembershipChecker) {}

  execute(discordAccessToken: string): Promise<ClanMembership> {
    return this.membership.check(discordAccessToken);
  }
}
