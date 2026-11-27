/** Team colours, from the site's palette (design tokens in globals.css). */
export const TEAM_COLOURS = ["rune", "banner", "gain", "brass", "lightning", "steel"] as const;
export type TeamColour = (typeof TEAM_COLOURS)[number];

export const isTeamColour = (v: unknown): v is TeamColour =>
  typeof v === "string" && (TEAM_COLOURS as readonly string[]).includes(v);

export function validateTeamName(name: string): string | null {
  if (name.trim().length === 0) return "Give the team a name.";
  if (name.trim().length > 30) return "Keep team names under 30 characters.";
  return null;
}
