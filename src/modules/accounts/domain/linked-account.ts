/** How an account link was proven. */
export type VerificationMethod = "dink" | "admin";

/** An OSRS account linked to a user. */
export interface LinkedAccount {
  readonly id: string;
  readonly userId: string;
  /** Dink's account hash: stable across name changes. Null for admin-approved links made without Dink. */
  readonly dinkAccountHash: string | null;
  readonly rsn: string;
  /** Wise Old Man player id, also stable across name changes. */
  readonly womPlayerId: number | null;
  /** Wise Old Man naming: "ironman", "hardcore", "ultimate" or "regular". */
  readonly accountType: string;
  readonly verifiedVia: VerificationMethod;
  readonly verifiedAt: Date;
  readonly lastSeenAt: Date | null;
}

export type NewLinkedAccount = Omit<LinkedAccount, "id" | "verifiedAt">;

export type LinkedAccountChanges = Partial<Pick<LinkedAccount, "rsn" | "dinkAccountHash" | "accountType" | "lastSeenAt" | "verifiedVia">>;
