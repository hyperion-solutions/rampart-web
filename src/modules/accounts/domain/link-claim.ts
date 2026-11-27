export type ClaimStatus = "pending" | "approved" | "rejected";

/** A member's request to link an RSN without Dink. */
export interface LinkClaim {
  readonly id: string;
  readonly userId: string;
  readonly rsn: string;
  readonly womPlayerId: number;
  readonly accountType: string;
  readonly status: ClaimStatus;
  readonly createdAt: Date;
  readonly decidedAt: Date | null;
}

/** A pending claim with who asked, for the admin page. */
export interface PendingClaim extends LinkClaim {
  readonly requesterName: string;
}

export type NewLinkClaim = Pick<LinkClaim, "userId" | "rsn" | "womPlayerId" | "accountType">;
