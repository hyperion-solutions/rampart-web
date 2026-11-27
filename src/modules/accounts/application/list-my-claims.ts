import type { LinkClaim } from "../domain/link-claim";
import type { LinkClaimRepository } from "../domain/link-claim-repository";

export class ListMyClaims {
  constructor(private readonly claims: LinkClaimRepository) {}

  execute(userId: string): Promise<LinkClaim[]> {
    return this.claims.listForUser(userId);
  }
}
