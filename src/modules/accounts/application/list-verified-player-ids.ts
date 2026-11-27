import type { LinkedAccountRepository } from "../domain/linked-account-repository";

/** Wise Old Man ids of all RSNs linked to a member, for the "Verified" badge. */
export class ListVerifiedPlayerIds {
  constructor(private readonly accounts: LinkedAccountRepository) {}

  execute(): Promise<number[]> {
    return this.accounts.listLinkedWomPlayerIds();
  }
}
