# 0004: A Rampart Discord bot for bingo

- **Status:** Proposed
- **Date:** 2026-11-28
- **Release:** v0.6 Discord bot

## Context

Bingo now tracks drops by itself (0003). Dink sends a screenshot with each drop, which the site discards. The clan wants:

- the screenshot as proof of each counted drop, visible on the site;
- each team to get its own Discord channel when a board is created;
- drops posted to a general bingo channel.

Storing screenshots ourselves (e.g. Vercel Blob) costs storage, needs a retention policy, and keeps images with chat, names and locations on our side. The clan's Discord already stores media for free, and only members can see it.

Discord attachment links are signed and **expire** (about 24 hours since 2024), so saving a media link alone breaks the image later. A bot can ask Discord for fresh links to an attachment, and message links (`discord.com/channels/<guild>/<channel>/<message>`) never expire.

Webhooks can only post to one fixed channel. Creating channels, posting to any channel and looking messages up later need a **bot**. AGENTS.md listed "Discord bot integration" as out of scope; this record proposes bringing it in scope.

## Decision (proposed)

A Rampart Discord bot (application in the Discord developer portal, token in Vercel as `DISCORD_BOT_TOKEN`, read through `shared/config/env.ts`), used by the site over Discord's REST API. No always-on gateway connection: Vercel functions call Discord when something happens.

- **Team channels:** when a board is published, the bot creates a category for the board and one channel per team. Each team's channel is visible to its members' Discord accounts, admins and the bot. Admins can archive them when the board is finished.
- **Drop posts:** when a drop counts (from Dink or by hand), the site posts it to the team's channel and to a general bingo channel: tile, team, who got it, item, and Dink's screenshot when there is one. The site keeps the message's channel and message ids.
- **Images on the site:** the drop links to its Discord message. Thumbnails, if shown, use fresh attachment links from Discord's refresh endpoint, requested on page load and cached for less than a day. The site never stores image files.
- **Failure is safe:** if Discord is down or the bot lacks a permission, the drop still counts; posting is retried or skipped and logged.

Permissions: Manage Channels, View Channels, Send Messages, Attach Files, Read Message History. The bot only acts in the Rampart server (`site.discordGuildId`).

## Consequences

- No image storage or cost on our side; pictures stay inside the clan's server.
- A new secret to manage (bot token), and a new external dependency on Discord for posts (not for scoring).
- The privacy page must say screenshots are posted to the clan's Discord and that the site keeps message ids.
- Discord rate limits (about 5 messages per 5 seconds per channel) are far above bingo traffic, but posting must handle 429 responses.
- Members' Discord accounts are already known from sign-in, so team channel permissions need no extra linking.
