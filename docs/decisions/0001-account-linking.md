# 0001: Account linking with Discord sign-in and Dink

- **Status:** Accepted
- **Date:** 2026-11-26
- **Release:** v0.2 Accounts (#8)

## Context

Members want to sign in to the site and connect their OSRS accounts (RSNs), so the site can show their progress and, later, run bingo boards.

- **Wise Old Man has no user accounts.** Nothing there proves that a person owns an RSN. It does keep the same player id across name changes (for example, Judgers was previously "Requitable"), and allows 20 requests a minute without an API key.
- **The game has no public login we can use.** The only trustworthy proof of ownership comes from the game client itself, through RuneLite.
- **Dink** is an existing RuneLite Plugin Hub plugin that many clans already use. It can post notifications to any web server, not just Discord. On login it can send a character summary (`LOGIN`) to a custom webhook, including `playerName`, `accountType` and `dinkAccountHash`, a player hash that Dink documents as persistent across name changes. It also sends loot, collection log, levels, kill count, pets and more, optionally with screenshots.
- **Our own RuneLite plugin** is possible, but it must be Java, pass Plugin Hub review on every update, show a warning about sending data to third-party servers, and RuneLite rejects plugins that "expose player information over HTTP", which would need clarifying for us.

## Decision

1. **Identity is a Discord account.** Members sign in with Discord (Auth.js). Only members of the Rampart Discord server can sign in.
2. **RSN ownership is proven through Dink.**
   - A signed-in member creates a personal webhook URL on the site: `/api/dink/<token>`.
   - They paste it into Dink under **Advanced** (custom webhook) and log in to the game.
   - Dink posts a `LOGIN` notification. The site finds the user by the token and links `dinkAccountHash` and `playerName` to them, then resolves the Wise Old Man player id.
   - Only someone logged in to that game account can produce this, so it proves control without passwords or codes.
3. **Manual fallback.** Members who don't use Dink can submit a claim, which a Rampart admin (Discord role) approves.
4. **No custom RuneLite plugin for now.** We revisit this for bingo in v0.3 (#32), alongside the "Bingo with Dink Notifications" plugin.

## What we store

| Data | Why |
| --- | --- |
| Discord id, username, avatar | Identity and display |
| Link token (hashed only) | Matching Dink requests to a member; revocable |
| `dinkAccountHash` | Stable account identity across name changes |
| RSN, account type | Display, matching to Wise Old Man |
| Wise Old Man player id | Stats; also stable across name changes |
| How the link was verified (Dink or admin), last seen | Trust and troubleshooting |

We don't store passwords, emails, or full Dink payloads. Members can unlink accounts and delete all their data (#31).

## Security

- Tokens are long random values, stored only as hashes, and can be revoked and replaced at any time.
- Unknown or revoked tokens get `404`. Requests are rate limited per token.
- Payloads are validated before use and never logged in full.
- A shared token only lets someone link an account they are logged in to, to the token owner. The link page tells members to keep their URL private.

## Consequences

- Members need RuneLite with Dink to self-verify; the admin fallback covers everyone else.
- We depend on Dink's payload format. Test it first (#21) and keep a sample payload in `docs/dink/`.
- The same Dink connection can feed bingo events later without a new integration.
- We add a database (Postgres via the Vercel Marketplace, Drizzle ORM) and authentication, which AGENTS.md previously listed as out of scope.
