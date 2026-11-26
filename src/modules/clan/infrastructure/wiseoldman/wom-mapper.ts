import type { Clan, Gainer } from "../../domain/clan";
import type { Member } from "../../domain/member";
import { womAccountTypeIconUrl, womProfileUrl, womRankIconUrl } from "./wom-assets";
import type { WomGainEntry, WomGroupDetails, WomMembership } from "./wom-types";

const toMember = ({ player: p, role, createdAt, clientSyncJoinedAt }: WomMembership): Member => ({
  id: p.id,
  username: p.username,
  displayName: p.displayName,
  role,
  accountType: p.type,
  build: p.build,
  ehp: p.ehp,
  ehb: p.ehb,
  totalExp: p.exp,
  joinedAt: new Date(clientSyncJoinedAt ?? createdAt),
  lastProgressedAt: p.lastChangedAt ? new Date(p.lastChangedAt) : null,
  icons: { rank: womRankIconUrl(role), accountType: womAccountTypeIconUrl(p.type) },
  profileUrl: womProfileUrl(p.username),
});

export const toClan = (g: WomGroupDetails): Clan => ({
  id: g.id,
  name: g.name,
  description: g.description,
  homeworld: g.homeworld,
  members: g.memberships.map(toMember),
  rankOrder: [...g.roleOrders].sort((a, b) => a.index - b.index).map((r) => r.role),
});

export const toGainer = (e: WomGainEntry): Gainer => ({
  playerId: e.player.id, displayName: e.player.displayName, gained: e.data.gained,
});
