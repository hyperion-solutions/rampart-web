import "server-only";
import { GetClanRoster } from "@/modules/clan/application/get-clan-roster";
import { GetClanOverview } from "@/modules/clan/application/get-clan-overview";
import { GetTopGainers } from "@/modules/clan/application/get-top-gainers";
import { WomClanRepository } from "@/modules/clan/infrastructure/wiseoldman/wom-clan-repository";
import { WomClient } from "@/modules/clan/infrastructure/wiseoldman/wom-client";
import { CheckClanMembership } from "@/modules/accounts/application/check-clan-membership";
import { CreateLinkToken } from "@/modules/accounts/application/create-link-token";
import { DecideLinkClaim } from "@/modules/accounts/application/decide-link-claim";
import { ListMyClaims } from "@/modules/accounts/application/list-my-claims";
import { ListPendingClaims } from "@/modules/accounts/application/list-pending-claims";
import { SubmitLinkClaim } from "@/modules/accounts/application/submit-link-claim";
import { DrizzleLinkClaimRepository } from "@/modules/accounts/infrastructure/db/drizzle-link-claim-repository";
import { DeleteMyAccount } from "@/modules/accounts/application/delete-my-account";
import { GetMyAccountsOverview } from "@/modules/accounts/application/get-my-accounts-overview";
import { GetLinkToken } from "@/modules/accounts/application/get-link-token";
import { LinkAccountFromDink } from "@/modules/accounts/application/link-account-from-dink";
import { ListVerifiedPlayerIds } from "@/modules/accounts/application/list-verified-player-ids";
import { ListMyAccounts } from "@/modules/accounts/application/list-my-accounts";
import { RevokeLinkToken } from "@/modules/accounts/application/revoke-link-token";
import { UnlinkAccount } from "@/modules/accounts/application/unlink-account";
import { ClanRosterDirectory } from "@/modules/accounts/infrastructure/clan/clan-roster-directory";
import { DrizzleLinkTokenRepository } from "@/modules/accounts/infrastructure/db/drizzle-link-token-repository";
import { DrizzleLinkedAccountRepository } from "@/modules/accounts/infrastructure/db/drizzle-linked-account-repository";
import { SignInWithDiscord } from "@/modules/accounts/application/sign-in-with-discord";
import { getAccountsDb } from "@/modules/accounts/infrastructure/db/client";
import { DrizzleUserRepository } from "@/modules/accounts/infrastructure/db/drizzle-user-repository";
import { readDinkNotification } from "@/modules/accounts/infrastructure/dink/read-dink-notification";
import { DiscordGuildMembership } from "@/modules/accounts/infrastructure/discord/discord-guild-membership";
import { SearchItems } from "@/modules/items/application/search-items";
import { DrizzleItemSearchRepository } from "@/modules/items/infrastructure/db/drizzle-item-search-repository";
import { ImportItemCatalog } from "@/modules/items/application/import-item-catalog";
import { getItemsDb } from "@/modules/items/infrastructure/db/client";
import { DrizzleItemCatalogRepository } from "@/modules/items/infrastructure/db/drizzle-item-catalog-repository";
import { HttpItemSourceReader } from "@/modules/items/infrastructure/sources/http-item-source-reader";
import { ChangeBoardStatus } from "@/modules/bingo/application/change-board-status";
import { ClearTile } from "@/modules/bingo/application/clear-tile";
import { CreateBoard } from "@/modules/bingo/application/create-board";
import { GetBoardOverview } from "@/modules/bingo/application/get-board-overview";
import { ListBoards } from "@/modules/bingo/application/list-boards";
import { SaveTile } from "@/modules/bingo/application/save-tile";
import { UpdateBoard } from "@/modules/bingo/application/update-board";
import { getBingoDb } from "@/modules/bingo/infrastructure/db/client";
import { DrizzleBoardRepository } from "@/modules/bingo/infrastructure/db/drizzle-board-repository";
import { DrizzleCompletionRepository } from "@/modules/bingo/infrastructure/db/drizzle-completion-repository";
import { DrizzleTeamRepository } from "@/modules/bingo/infrastructure/db/drizzle-team-repository";
import { DrizzleTileRepository } from "@/modules/bingo/infrastructure/db/drizzle-tile-repository";
import { env } from "@/shared/config/env";
import { site } from "@/shared/config/site";

/** Composition root: the ONLY place concrete classes are wired to ports. */
export function createContainer() {
  const client = new WomClient({ baseUrl: env.womBaseUrl, userAgent: env.womUserAgent });
  const clanRepository = new WomClanRepository(client, env.womGroupId);
  const clanMembership = new DiscordGuildMembership(site.discordGuildId, site.clanRankRoles);
  const users = new DrizzleUserRepository(getAccountsDb);
  const linkTokens = new DrizzleLinkTokenRepository(getAccountsDb);
  const linkedAccounts = new DrizzleLinkedAccountRepository(getAccountsDb);
  const clanRoster = new ClanRosterDirectory(clanRepository);
  const linkClaims = new DrizzleLinkClaimRepository(getAccountsDb);
  const bingoBoards = new DrizzleBoardRepository(getBingoDb);
  const bingoTiles = new DrizzleTileRepository(getBingoDb);
  const bingoTeams = new DrizzleTeamRepository(getBingoDb);
  const bingoCompletions = new DrizzleCompletionRepository(getBingoDb);
  return {
    getClanOverview: new GetClanOverview(clanRepository),
    getTopGainers: new GetTopGainers(clanRepository),
    getClanRoster: new GetClanRoster(clanRepository),
    importItemCatalog: new ImportItemCatalog(
      new HttpItemSourceReader("rampart-web item catalog (OSRS clan website)"),
      new DrizzleItemCatalogRepository(getItemsDb),
    ),
    searchItems: new SearchItems(new DrizzleItemSearchRepository(getItemsDb)),
    signInWithDiscord: new SignInWithDiscord(clanMembership, users),
    deleteMyAccount: new DeleteMyAccount(users),
    checkClanMembership: new CheckClanMembership(clanMembership),
    createLinkToken: new CreateLinkToken(linkTokens),
    revokeLinkToken: new RevokeLinkToken(linkTokens),
    getLinkToken: new GetLinkToken(linkTokens),
    linkAccountFromDink: new LinkAccountFromDink(
      linkTokens,
      linkedAccounts,
      clanRoster,
      site.clanName,
    ),
    listMyAccounts: new ListMyAccounts(linkedAccounts),
    getMyAccountsOverview: new GetMyAccountsOverview(linkedAccounts, clanRoster),
    listVerifiedPlayerIds: new ListVerifiedPlayerIds(linkedAccounts),
    submitLinkClaim: new SubmitLinkClaim(linkClaims, linkedAccounts, clanRoster),
    listMyClaims: new ListMyClaims(linkClaims),
    listPendingClaims: new ListPendingClaims(linkClaims),
    decideLinkClaim: new DecideLinkClaim(linkClaims, linkedAccounts),
    bingo: {
      createBoard: new CreateBoard(bingoBoards),
      updateBoard: new UpdateBoard(bingoBoards, bingoTiles),
      changeBoardStatus: new ChangeBoardStatus(bingoBoards),
      listBoards: new ListBoards(bingoBoards),
      getBoardOverview: new GetBoardOverview(bingoBoards, bingoTiles, bingoTeams, bingoCompletions),
      saveTile: new SaveTile(bingoBoards, bingoTiles),
      clearTile: new ClearTile(bingoBoards, bingoTiles),
    },
    unlinkAccount: new UnlinkAccount(linkedAccounts),
    /** Turns a Dink HTTP request into a domain notification (adapter). */
    readDinkNotification,
  };
}
export const container = createContainer();
