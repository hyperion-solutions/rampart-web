import type { Clan, Gainer } from "../../domain/clan";
import type { Member } from "../../domain/member";
import type { WomGainEntry, WomGroupDetails, WomPlayer } from "./wom-types";

const toMember = (p: WomPlayer, role: string): Member => ({
  id: p.id, username: p.username, displayName: p.displayName, role,
  accountType: p.type, ehp: p.ehp, ehb: p.ehb, totalExp: p.exp,
});

export const toClan = (g: WomGroupDetails): Clan => ({
  id: g.id, name: g.name, description: g.description, homeworld: g.homeworld,
  members: g.memberships.map((m) => toMember(m.player, m.role)),
});

export const toGainer = (e: WomGainEntry): Gainer => ({
  displayName: e.player.displayName, gained: e.data.gained,
});
