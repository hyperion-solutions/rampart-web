/** Public Wise Old Man URLs for icons and profiles. */
const WOM_SITE = "https://wiseoldman.net";

export const womRankIconUrl = (role: string) => `${WOM_SITE}/img/group_roles/${role}.png`;
export const womAccountTypeIconUrl = (type: string) => `${WOM_SITE}/img/player_types/${type}.png`;
export const womProfileUrl = (username: string) => `${WOM_SITE}/players/${encodeURIComponent(username)}`;
