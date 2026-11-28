# 0007: Filter Dink traffic at the edge with a Cloudflare Worker

- **Status:** Proposed
- **Date:** 2026-11-28
- **Release:** v0.4 Bingo tracking (#110)

## Context

Members paste their Dink link into **Primary Webhook URLs** and turn Loot on. Most will leave **Min Loot Value at 0** (Dink's default), because the same value controls their Discord loot posts and they won't revisit settings. From Dink's source (`DinkPluginConfig.java`, `LootNotifier.java`):

- Every notifier is **off by default**; members turn Loot on (and maybe levels, deaths, quests...). Everything enabled goes to every Primary Webhook URL, so it all reaches us, 24/7, bingo or not.
- Loot fires for **NPC kills, player kills, chests/events (raids, Barrows, clues) and pickpocketing**, not skilling. At Min Loot Value 0 that's one request per kill or pickpocket: roughly tens an hour bossing, hundreds an hour on slayer or low-level combat, and potentially 1,000+ an hour thieving.

Every request to the site is a Vercel function call (Hobby: 1M a month, 4 hours of active CPU), and almost none of them matter: only logins/logouts and loot containing a bingo item do anything. Asking members to raise Min Loot Value or move the link to a Loot override (0006) won't reliably happen.

Dink's community already solves this with a filter in front of the webhook: Dink's own authors publish [dink-url-manager](https://github.com/pajlads/dink-url-manager), a Cloudflare Worker that forwards only allowed requests, and [zneix/dink-filter](https://github.com/zneix/dink-filter) forwards Dink requests "only if they meet destination-specific rules".

## Decision (proposed)

Put a **Cloudflare Worker** in front of `/api/dink/*`. **We filter, not members.**

- Members' Dink links point at the Worker (e.g. `https://rampart-dink.<account>.workers.dev/api/dink/<secret>`); setup on the link page is unchanged otherwise. The site generates links with the Worker's address (a config value).
- The Worker **forwards** to the site, unchanged (body, multipart screenshot, headers):
  - `LOGIN` and `LOGOUT` (account linking);
  - `LOOT` whose `extra.items` contains a tracked item id (on a board that's published and not over).
- It **answers 200 and drops** everything else (other types, and loot with no tracked item): no Vercel call, no database.
- `GET .../config` (0006) is forwarded too.
- Tracked item ids come from a new site endpoint, cached in the Worker for a few minutes (Workers Cache API), so a newly published board is picked up quickly. Ids are matched after Dink's raw ids, so the endpoint returns every id (noted/variant) that maps to a tracked item.
- The Worker never stores payloads and doesn't log them; secrets stay in the URL path as today.

## Consequences

- Vercel only sees requests that can matter; member settings don't affect our costs.
- Cloudflare Workers' free plan covers 100,000 requests a day (about 3M a month), with no charge beyond that on the free plan (requests over the limit fail until the next day). Heavy days are possible but far less likely than at 1M a month on Vercel with everything passing through.
- A second service and account (Cloudflare) to run and deploy, its own code (small, TypeScript) and secrets.
- Existing links (Vercel address) keep working; members move to the Worker address by creating a new link, or the site can keep accepting both.
- Before building: measure real traffic during one board (Vercel Usage, `[dink]` logs) to confirm it's needed.
