import type { LinkedAccount } from "../domain/linked-account";
import type { LinkedAccountRepository } from "../domain/linked-account-repository";

export class ListMyAccounts {
  constructor(private readonly accounts: LinkedAccountRepository) {}

  execute(userId: string): Promise<LinkedAccount[]> {
    return this.accounts.listForUser(userId);
  }
}
