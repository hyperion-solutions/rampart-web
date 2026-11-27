import type { Member } from "@/modules/clan/domain/member";
import type { ClanMemberLookup } from "../domain/clan-member-lookup";
import type { LinkedAccount } from "../domain/linked-account";
import type { LinkedAccountRepository } from "../domain/linked-account-repository";

export interface AccountOverview {
  readonly account: LinkedAccount;
  /** Current clan stats, or null when the account is no longer in the clan. */
  readonly member: Member | null;
}

/** A member's linked accounts with their current clan rank and stats. */
export class GetMyAccountsOverview {
  constructor(
    private readonly accounts: LinkedAccountRepository,
    private readonly clan: ClanMemberLookup,
  ) {}

  async execute(userId: string): Promise<AccountOverview[]> {
    const accounts = await this.accounts.listForUser(userId);
    const ids = accounts.flatMap((a) => (a.womPlayerId === null ? [] : [a.womPlayerId]));
    const members = ids.length > 0 ? await this.clan.findByWomPlayerIds(ids) : new Map<number, Member>();
    return accounts.map((account) => ({
      account,
      member: account.womPlayerId === null ? null : (members.get(account.womPlayerId) ?? null),
    }));
  }
}
