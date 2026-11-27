/** Where someone stands in the clan's Discord server. */
export type ClanMembership =
  | { readonly status: "ranked"; readonly rank: string }
  | { readonly status: "no-rank" }
  | { readonly status: "not-in-server" };

/** Port: checks someone's place in the clan's Discord server. */
export interface ClanMembershipChecker {
  /** Uses the user's own Discord access token from sign-in. */
  check(discordAccessToken: string): Promise<ClanMembership>;
}
