# 0003: Automatic bingo tracking from Dink loot

- **Status:** Accepted
- **Date:** 2026-11-27
- **Release:** v0.4 Bingo tracking (#32)

## Context

Bingo drops are added by hand: an admin or the team's captain picks the tile, who got it and which item, usually from a Discord screenshot. Members already have a personal Dink link (0001), and tiles store OSRS item ids (0002), so Dink's loot notifications can be matched to tiles directly.

Options considered (#32):
1. **Our site receives Dink events** on the existing personal link.
2. **The "Bingo with Dink Notifications" plugin**, which keeps its own board outside our site.
3. **Our own RuneLite plugin**: full control, but Java, Plugin Hub review for every change, and RuneLite's rules on sending player data.

## Decision

Option 1. Dink `LOOT` notifications sent to a member's link count toward running boards:

- **Who:** the link's owner, and only for game accounts already linked to them (matched by Dink's account hash). Loot from any other account is ignored.
- **When:** only between the board's start and end, on live boards. After the end, admins can still add late drops by hand until they finish the board.
- **What:** each item id is mapped to its canonical id (noted and variant ids count), then added to every tile listing it on the member's team, through the same use case as manual drops (`AddTileProgress`, source `dink`). The "any"/"all" tile rules, locking and undo behave exactly as for manual drops.
- **Only `LOOT`:** a first-time collection log item also arrives as `LOOT`, so counting `COLLECTION` too would double count. Repeat drops only arrive as `LOOT`.
- **Stored:** the item, amount, account RSN, time and "From <source>" as the note. Never the full payload or the screenshot.

Members add their link to Dink's **Primary Webhook URLs** (LOGIN uses the **Custom Metadata Handler**), and to **Webhook Overrides → Loot Webhook Override** if they use one, with **Loot** on and a low **Min Loot Value**. The link page explains this.

## Consequences

- Drops count within seconds, with no screenshots for most tiles. Admins and captains keep manual adding and undo for mistakes and for things Dink doesn't report as loot (pets, kill counts, levels).
- Pets don't arrive as `LOOT` (Dink's `PET` notification has no item id), so pet tiles stay manual for now.
- Dink sends no event id, so a resent notification would count twice. Undo fixes the rare case.
- Built against Dink's documented `LOOT` format (pajlads/DinkPlugin `docs/json-examples.md`); confirm with one real drop.
