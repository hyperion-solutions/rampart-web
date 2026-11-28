# 0006: Keep members' Dink loot allowlist current with Dynamic Config

- **Status:** Accepted
- **Date:** 2026-11-28
- **Release:** v0.4 Bingo tracking (#106)

## Context

Bingo counts Dink loot (0003). With **Min Loot Value = 0**, Dink sends every kill, all the time, not only during bingo; each request is a Vercel function call (Hobby includes 1M a month). Dink's **Item Allowlist** ("Always fire notifications for these items, despite value settings"; one name per line, case-insensitive, `*` wildcards) plus a normal Min Loot Value sends bingo items and valuable drops only, but members would have to update it for every board.

Options (#106): change nothing; a copy-paste allowlist per board; Dink's **Dynamic Config URL** served by the site; measure first.

Findings from Dink's source (`SettingsManager.java`) and a live test (#108):
- The config is a flat JSON object of Dink setting names to values. **Only keys present are changed.**
- Dink imports it when it starts, as soon as the URL is set or changed, and at login if 3+ hours passed since the last import.
- `lootItemAllowlist` is **merged** (lines added, never removed) unless the member ticks **Import Policy → Overwrite Item Lists**, which makes it exactly what we send. It only affects the keys we send.
- Live test: Dink fetched the URL and added the test lines to the allowlist; no other setting changed. Dink's settings panel only shows imported changes after reopening it.

## Decision

- `GET <Dink link>/config` serves `{"lootItemAllowlist": "<names>"}` for an active link: the names of every item on tiles of boards that are **published and not over** (including boards that haven't started, so members have them before the start). Names include each item's in-game variants (Wiki and RuneLite names), since Dink matches by name.
- We send **only** that key. Never webhooks, Min Loot Value or anything else.
- An empty list is sent when no board is running, so, with Overwrite Item Lists, items from finished boards drop off.
- Members set it up once (link page): Dynamic Config URL, **Overwrite Item Lists** unless they keep their own allowlist, and their usual Min Loot Value instead of 0.

## Consequences

- One-time setup; no per-board steps. Traffic drops to bingo items plus whatever members already send.
- New board items reach members at their next RuneLite start or within 3 hours of logging in; publish boards before they start.
- Members who don't tick Overwrite Item Lists keep old boards' items in their allowlist (harmless, but they keep reporting those drops). They can clear them by hand.
- The board's item names are visible to anyone with a member's link, which is no more than members see on the board.
