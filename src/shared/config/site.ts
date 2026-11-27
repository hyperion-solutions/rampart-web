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
   * Rank role icons, copied from the Rampart Discord (64x64 PNGs in public/icons/ranks).
   * Recruit has no icon in Discord, so it shows none.
   */
  clanRankIcons: {
    Bronze: "/icons/ranks/bronze.png",
    Iron: "/icons/ranks/iron.png",
    Steel: "/icons/ranks/steel.png",
    Black: "/icons/ranks/black.png",
    Mithril: "/icons/ranks/mithril.png",
    Adamant: "/icons/ranks/adamant.png",
    Rune: "/icons/ranks/rune.png",
    Dragon: "/icons/ranks/dragon.png",
    Officer: "/icons/ranks/officer.png",
    "Co-leader": "/icons/ranks/co-leader.png",
    Leader: "/icons/ranks/leader.png",
  } as Readonly<Record<string, string>>,
} as const;
