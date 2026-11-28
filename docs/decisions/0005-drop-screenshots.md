# 0005: Store drop screenshots ourselves, resized, in Vercel Blob

- **Status:** Proposed
- **Date:** 2026-11-28
- **Release:** v0.4 Bingo tracking
- **Amends:** 0004 (images on the site no longer come from Discord)

## Context

Dink sends a screenshot with each drop (multipart field `file`), and the site discards it (0003). The clan wants it as proof on the board. 0004 proposed showing images from Discord messages, but that ties the site to the bot, and Discord attachment links expire after about a day.

Expected volume is small: a few hundred counted drops per month. Vercel Blob on the Hobby plan includes, per month (docs, Sept 2026): 1 GB storage, 10 GB data transfer, 2,000 advanced operations (uploads) and 10,000 simple operations (reads). Going over doesn't cost money on Hobby, but **Blob stops working until the 30 days pass**, so we stay well under. AWS S3 or Cloudflare R2 would work too, but add an account, keys and bucket policies for no gain at this size.

Vercel Functions on Hobby accept request bodies up to **4.5 MB**. Dink screenshots are usually 0.5 to 2 MB; larger ones are rejected before our code runs, and the drop is lost with them.

## Decision (proposed)

- **Store only screenshots of drops that count.** When `RecordDinkDrops` counts a drop and the request has a screenshot, the site stores it and links it to the progress entry. Loot that doesn't count is never stored.
- **Resize on upload** with sharp (ships with Next.js): a WebP up to 1280 px wide (about 100 to 200 KB) and a 320 px thumbnail (about 15 KB). The original PNG is never stored. 500 drops take about 50 to 100 MB, about 5 to 10% of the included storage.
- **Vercel Blob**, behind a `ScreenshotStore` port in the bingo module, so moving to S3 or R2 later is a new adapter. Blob paths are random and unguessable; the board page shows them only to signed-in members.
- **Retention:** a board's screenshots are deleted 30 days after it's finished (by the existing cron). Deleting a member's data deletes their screenshots straight away.
- **Upload failure is safe:** if storing fails, the drop still counts, without a picture.
- **Members' Dink setup:** recommend **Screenshot Scale** at 50 to 75% and **Hide Chat in Images**, to stay under the 4.5 MB limit and keep chat out of pictures.

## Consequences

- Proof for each Dink drop, on the board, with no Discord dependency. The Discord bot (0004) can still post the same stored image.
- Screenshots can show other players' names and the location; the privacy page must say what is kept, for how long, and who can see it.
- New env var `BLOB_READ_WRITE_TOKEN`, added automatically when a Blob store is connected to the project.
- If usage grows past the free allowances, options are Vercel Pro (about $0.023 per GB-month) or Cloudflare R2 (10 GB free, no download fees).
