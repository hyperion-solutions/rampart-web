import type { ClanMembershipChecker } from "../domain/clan-membership";
import type { DiscordProfile, User } from "../domain/user";
import type { UserRepository } from "../domain/user-repository";

export type SignInResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly reason: "not-a-member" };

/** Lets Rampart Discord members in, and records who they are. */
export class SignInWithDiscord {
  constructor(
    private readonly membership: ClanMembershipChecker,
    private readonly users: UserRepository,
  ) {}

  async execute(profile: DiscordProfile, discordAccessToken: string): Promise<SignInResult> {
    if (!(await this.membership.isMember(discordAccessToken))) {
      return { ok: false, reason: "not-a-member" };
    }
    return { ok: true, user: await this.users.upsertFromDiscord(profile) };
  }
}
