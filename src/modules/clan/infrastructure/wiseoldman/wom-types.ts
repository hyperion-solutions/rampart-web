/** Raw API shapes (only the fields we use). Never leak these outside infrastructure. */
export interface WomPlayer {
  id: number; username: string; displayName: string; type: string;
  ehp: number; ehb: number; exp: number;
}
export interface WomGroupDetails {
  id: number; name: string; description: string | null; homeworld: number | null;
  memberships: { role: string; player: WomPlayer }[];
}
export interface WomGainEntry {
  player: WomPlayer;
  data: { gained: number };
}
