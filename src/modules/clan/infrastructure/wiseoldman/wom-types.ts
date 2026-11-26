/** Raw API shapes (only the fields we use). Never leak these outside infrastructure. */
export interface WomPlayer {
  id: number; username: string; displayName: string; type: string; build: string;
  ehp: number; ehb: number; exp: number;
  lastChangedAt: string | null;
}
export interface WomMembership {
  role: string;
  createdAt: string;
  /** When the player joined the clan in game, as synced by the RuneLite plugin. */
  clientSyncJoinedAt: string | null;
  player: WomPlayer;
}
export interface WomGroupDetails {
  id: number; name: string; description: string | null; homeworld: number | null;
  memberships: WomMembership[];
  roleOrders: { role: string; index: number }[];
}
export interface WomGainEntry {
  player: WomPlayer;
  data: { gained: number };
}
