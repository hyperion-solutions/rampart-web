import type { PendingClaim } from "../domain/link-claim";
import type { LinkClaimRepository } from "../domain/link-claim-repository";

/** Claims waiting for an admin, oldest first. Callers must check the viewer is an admin. */
export class ListPendingClaims {
  constructor(private readonly claims: LinkClaimRepository) {}

  execute(): Promise<PendingClaim[]> {
    return this.claims.listPending();
  }
}
