/** Public, non-secret site settings. Secrets and per-environment values belong in env.ts. */
export const site = {
  /** Production address, used to build absolute URLs for social previews. */
  url: "https://rampart-web-alpha.vercel.app",
  /** Permanent invite to the Rampart Discord server. */
  discordInviteUrl: "https://discord.gg/j6kYFNjNaa",
  /** Rampart Discord server id. Only its members with a clan rank role can sign in. */
  discordGuildId: "1523846871708340294",
  /** Where members without a rank ask for one. */
  rankRequestChannelId: "1523877215106891888",
  /**
   * Discord roles that mean "has a clan rank". Holding any one of them lets someone sign in.
   * Other roles (e.g. reaction roles like @Raiders) don't count.
   */
  clanRankRoles: {
    Recruit: "1523902713581142017",
    Bronze: "1523902978317090826",
    Iron: "1523903184777515135",
    Steel: "1523903561933652029",
    Black: "1523903674869354526",
    Mithril: "1523903988876185823",
    Adamant: "1523904183038644385",
    Rune: "1523904387242524794",
    Dragon: "1523904470793326712",
    Officer: "1523870485845114930",
    "Co-leader": "1524188588336480387",
    Leader: "1523868355088617654",
  },
  /**
   * In-game clan rank icon to show for each Discord rank (Wise Old Man's icon names).
   * Co-leader has no icon of its own, so it uses Deputy owner's key; Black has none and shows no icon.
   */
  clanRankIcons: {
    Recruit: "recruit",
    Bronze: "bronze",
    Iron: "iron",
    Steel: "steel",
    Mithril: "mithril",
    Adamant: "adamant",
    Rune: "rune",
    Dragon: "dragon",
    Officer: "officer",
    "Co-leader": "deputy_owner",
    Leader: "leader",
  } as Readonly<Record<string, string>>,
} as const;
