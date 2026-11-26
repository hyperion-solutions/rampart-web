import type { Clan } from "../domain/clan";
import type { ClanRepository } from "../domain/clan-repository";

export class GetClanOverview {
  constructor(private readonly clans: ClanRepository) {}

  async execute(): Promise<Clan> {
    return this.clans.getClan();
  }
}
