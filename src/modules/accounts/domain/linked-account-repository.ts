import type { LinkedAccount, LinkedAccountChanges, NewLinkedAccount } from "./linked-account";

/** Port: stores linked OSRS accounts. */
export interface LinkedAccountRepository {
  findByDinkHash(dinkAccountHash: string): Promise<LinkedAccount | null>;
  findByWomPlayerId(womPlayerId: number): Promise<LinkedAccount | null>;
  listForUser(userId: string): Promise<LinkedAccount[]>;
  create(account: NewLinkedAccount): Promise<LinkedAccount>;
  update(id: string, changes: LinkedAccountChanges): Promise<LinkedAccount>;
  /** Removes the link only if it belongs to the user. Returns whether anything was removed. */
  deleteForUser(userId: string, id: string): Promise<boolean>;
}
