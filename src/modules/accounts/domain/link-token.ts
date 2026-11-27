/** What happened the last time Dink used a link token. */
export type LinkOutcome = "linked" | "updated" | "not-in-clan" | "owned-by-someone-else";

export interface LinkAttempt {
  readonly rsn: string;
  readonly outcome: LinkOutcome;
  readonly at: Date;
}

/** A member's personal Dink link. The secret itself is never stored, only a hash of it. */
export interface LinkToken {
  readonly id: string;
  readonly userId: string;
  readonly createdAt: Date;
  readonly lastUsedAt: Date | null;
  readonly lastAttempt: LinkAttempt | null;
}

/** Returned once, when a token is created: the only time the secret is available. */
export interface IssuedLinkToken {
  readonly secret: string;
  readonly linkToken: LinkToken;
}
