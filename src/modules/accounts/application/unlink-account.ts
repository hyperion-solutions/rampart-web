import type { LinkedAccountRepository } from "../domain/linked-account-repository";

/** Removes one of the member's own linked accounts. */
export class UnlinkAccount {
  constructor(private readonly accounts: LinkedAccountRepository) {}

  execute(userId: string, accountId: string): Promise<boolean> {
    return this.accounts.deleteForUser(userId, accountId);
  }
}
