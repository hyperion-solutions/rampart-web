import type { ClaimStatus, LinkClaim, NewLinkClaim, PendingClaim } from "./link-claim";

/** Port: stores link claims. At most one pending claim per Wise Old Man player. */
export interface LinkClaimRepository {
  create(claim: NewLinkClaim): Promise<LinkClaim>;
  findById(id: string): Promise<LinkClaim | null>;
  findPendingForPlayer(womPlayerId: number): Promise<LinkClaim | null>;
  listForUser(userId: string): Promise<LinkClaim[]>;
  listPending(): Promise<PendingClaim[]>;
  decide(id: string, status: Exclude<ClaimStatus, "pending">, decidedBy: string): Promise<void>;
}
