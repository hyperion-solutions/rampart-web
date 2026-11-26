/** Port: checks whether a Discord user belongs to the clan's Discord server. */
export interface ClanMembershipChecker {
  /** Uses the user's own Discord access token from sign-in. */
  isMember(discordAccessToken: string): Promise<boolean>;
}
