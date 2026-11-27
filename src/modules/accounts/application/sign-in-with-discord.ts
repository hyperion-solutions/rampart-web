import type { ClanMembershipChecker } from "../domain/clan-membership";
import type { DiscordProfile, User } from "../domain/user";
import type { UserRepository } from "../domain/user-repository";

export type SignInResult =
  | { readonly ok: true; readonly user: User; readonly rank: string }
  | { readonly ok: false; readonly reason: "not-in-server" | "no-rank" };

/** Lets ranked Rampart members in, and records who they are. */
export class SignInWithDiscord {
  constructor(
    private readonly membership: ClanMembershipChecker,
    private readonly users: UserRepository,
  ) {}

  async execute(profile: DiscordProfile, discordAccessToken: string): Promise<SignInResult> {
    const membership = await this.membership.check(discordAccessToken);
    if (membership.status !== "ranked") return { ok: false, reason: membership.status };
    return { ok: true, user: await this.users.upsertFromDiscord(profile), rank: membership.rank };
  }
}
