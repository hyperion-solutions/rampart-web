# Dink payloads

Real payloads captured from Dink (RuneLite 1.13.8, Dink 1.x) on 2026-11-26, with personal values replaced. Used as the reference for parsing Dink requests (#27). Field names and shapes are unchanged.

| File | Type | Sent when |
| --- | --- | --- |
| `login-payload.json` | `LOGIN` | A few seconds after logging in, to the **Custom Metadata Handler** URL (Dink → Advanced) |
| `logout-payload.json` | `LOGOUT` | On logging out, to the same URL |

## Findings (#21)

- **Format:** `application/json; charset=utf-8`, no screenshot. User agent `RuneLite/<version> (Dink/1.x)`.
- **Where to configure:** the login summary only goes to **Advanced → Custom Metadata Handler**, not to **Primary Webhook URLs** (that one is for loot, levels and other notifications).
- **`dinkAccountHash`:** 56 lowercase hex characters. It was identical across separate sessions (logout, then a later login). Dink documents it as persistent across name changes. Use it as the stable account identity.
- **`playerName`:** the current RSN. Can change; update it when it does.
- **`accountType`:** for example `IRONMAN`. Note Dink's values (`IRONMAN`, `HARDCORE_IRONMAN`, ...) differ from Wise Old Man's (`ironman`, `hardcore`, ...); map them in the adapter.
- **`clanName`:** sent when **Send Clan Name** is on (for example `Rampart`). Useful to check clan membership.
- **`discordUser`:** `{ id, name, avatarHash }`, sent when **Send Discord Profile** is on. Can confirm the Dink user is the same Discord user who signed in to the site; don't rely on it, since it's optional.
- **`extra` on `LOGIN`:** `world`, `skills` (`totalLevel`, `totalExperience`, per-skill `levels` and `experience`), `collectionLog`, `combatAchievementPoints`, `achievementDiary`, `achievementDiaryTasks`, `questCount`, `questPoints`, `slayer`, `barbarianAssault`, `pets`.
- **`embeds`:** Discord-formatted text. Ignore it; Dink's docs say third-party integrations should rely on `extra`.

## LOOT (#32)

Not captured yet: built from Dink's documented format (pajlads/DinkPlugin, `docs/json-examples.md`). Confirm with a real drop.

- **Where to configure:** **Primary Webhook URLs**, or the Loot **Webhook Override** if one is set (an override replaces the primary list for that notifier).
- **Fields used:** `extra.items[]` (`id`, `quantity`) and `extra.source` (e.g. `Tombs of Amascut`). Ignored: `priceEach`, `name`, `criteria`, `rarity`, `party`, `killCount`, raid metadata, `embeds`.
- **Sent only above** the loot notifier's **Min Loot Value** (or for allowlisted items).
- **Often multipart:** with a screenshot, the JSON is in `payload_json` and the image in `file` (ignored).
- **Item ids** can be noted or variant ids; bingo maps them to canonical ids.

## Dynamic Config URL (#106, decision 0006)

- Dink imports a flat JSON object of setting names (e.g. `{"lootItemAllowlist": "Raw chicken\nCowhide"}`) from **Advanced → Dynamic Config URL**: on start, when the URL changes, and at login every 3+ hours. Only keys present change.
- Allow/deny lists are merged unless **Import Policy → Overwrite Item Lists** is ticked. Imported changes show after reopening Dink's settings panel.
- We serve it at `<Dink link>/config` with only `lootItemAllowlist`.

Do not commit raw payloads: they contain the player's RSN, account hash, Discord id and location.
