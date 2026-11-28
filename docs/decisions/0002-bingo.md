# 0002: Bingo boards and the item catalog

- **Status:** Accepted
- **Date:** 2026-11-27
- **Release:** v0.3 Bingo (#9); automatic tracking in v0.4 (#32, see 0003)

## Context

Rampart runs clan bingo events. A board (example: osrsbingohub.com/boards/7747) is a grid, typically 5×5, of tiles. Each tile is a *named goal* worth points, for example "Inquisitor armour, 22 pts", which any piece of the set completes. Some tiles aren't items at all ("99 Runecraft", a boss kill count). Completed tiles turn green and add to the team's score; some boards add bonuses for full rows, columns, diagonals or the whole board, and allow repeat completions for fewer points.

Admins need to build boards from real OSRS items with their icons, including untradeable items (pets, capes, raid uniques), which are common bingo tiles. Members are already linked to their clan accounts (v0.2), and Dink can later report their drops by item id.

## Decision

### Bingo MVP (v0.3)

- **Board:** title, rules text, square grid from 3×3 to 7×7 (default 5×5), start and end time; status draft → live → finished. Admins (Officer and above) create and manage boards; members never see drafts.
- **Tile:** a position on the grid with a name, points, optional quantity ("x3") and description. Its items count in one of two ways (the tile's rule): **any of them** toward the quantity (the default), or **all of them**, each needed once (e.g. both crowns for a Twinflame; progress counts the distinct items). A tile with no items is a **text-only goal** (an item can still be picked just for its icon).
- **Team:** named, with members chosen only from site members with linked clan accounts; one team per member per board.
- **Completion:** a team completes a tile once. In the MVP, admins mark tiles (from screenshots posted in Discord), with an optional note.
- **Score:** the sum of a team's completed tiles. Every signed-in member sees every team's board and the scoreboard.

**Later:** row, column, diagonal and blackout bonuses; repeat completions; automatic completion from Dink loot and collection log events (v0.4, #32).

### Item catalog

We keep our own `items` table, imported on a schedule, rather than calling third parties while admins search.

| Source | Contents | Used for |
| --- | --- | --- |
| RuneLite item names, `static.runelite.net/cache/item/names.json` | Every item id (21,882 on 2026-11-27), untradeables included, current with game updates; names repeat for noted, placeholder and variant ids | The full list of ids |
| OSRS Wiki prices mapping, `prices.runescape.wiki/api/v1/osrs/mapping` | 4,682 tradeable items with members flag and disambiguated names ("Ardougne teleport (tablet)") | Better names, members and tradeable flags |
| RuneLite item icons, `static.runelite.net/cache/item/icon/<id>.png` | An icon for every item id | Tile and search icons, through our image service |

Rules:
- Every id from either source is stored. The name comes from the Wiki when it has the id, otherwise RuneLite.
- Each name has one **canonical** id: the Wiki's id when the Wiki lists that name, otherwise the lowest id. Every stored id points to its canonical id. Search shows canonical items only; Dink loot under any variant id still maps to the right item.
- The import upserts (safe to re-run), sends a descriptive User-Agent, and downloads each source once per run. It runs weekly in production (Vercel Cron, protected by `CRON_SECRET`) and on demand locally.

Rejected:
- **OSRS Wiki prices mapping alone:** tradeable only; no pets, Fire cape, Infernal cape or Olmlet.
- **osrsreboxed-db:** has useful noted/placeholder flags, but its last update was January 2025 and the file is 50 MB.
- **Hotlinking Wiki images by name:** names aren't stable ids, and Dink reports ids.

## Consequences

- Admins search any item, including ones added in recent game updates, within a week of release.
- RuneLite's static item endpoints aren't formally documented. If they change, the import fails loudly (descriptive error) and the existing catalog keeps working; osrsreboxed or the Wiki are the fallbacks.
- Item and tile data are keyed by item id, so v0.4 can match Dink loot directly.
- New tables (boards, tiles, teams, members, completions) store team membership, so the privacy page is updated with #57.
