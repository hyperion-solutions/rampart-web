import type { TeamColour } from "@/modules/bingo/domain/team-colours";

/** Literal class names so Tailwind keeps them. */
export const TEAM_SWATCH: Readonly<Record<TeamColour, string>> = {
  rune: "bg-rune",
  banner: "bg-banner",
  gain: "bg-gain",
  brass: "bg-brass",
  lightning: "bg-lightning",
  steel: "bg-steel",
};

export const teamSwatch = (colour: string | null) =>
  colour && colour in TEAM_SWATCH ? TEAM_SWATCH[colour as TeamColour] : "bg-mortar";
