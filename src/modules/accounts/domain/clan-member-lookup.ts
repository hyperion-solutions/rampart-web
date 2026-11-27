import type { Member } from "@/modules/clan/domain/member";

/** Port: current clan stats for accounts we already know by Wise Old Man player id. */
export interface ClanMemberLookup {
  /** Only ids still in the clan are in the result. */
  findByWomPlayerIds(womPlayerIds: readonly number[]): Promise<ReadonlyMap<number, Member>>;
}
