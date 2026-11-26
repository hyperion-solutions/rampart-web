import type { Clan, GainPeriod, Gainer } from "../../domain/clan";
import type { ClanRepository } from "../../domain/clan-repository";
import type { WomClient } from "./wom-client";
import { toClan, toGainer } from "./wom-mapper";
import type { WomGainEntry, WomGroupDetails } from "./wom-types";

/** Adapter: implements the ClanRepository port using Wise Old Man. */
export class WomClanRepository implements ClanRepository {
  constructor(private readonly client: WomClient, private readonly groupId: number) {}

  async getClan(): Promise<Clan> {
    return toClan(await this.client.get<WomGroupDetails>(`/groups/${this.groupId}`));
  }

  async getTopGainers(period: GainPeriod, limit: number): Promise<Gainer[]> {
    const rows = await this.client.get<WomGainEntry[]>(`/groups/${this.groupId}/gained`, {
      metric: "overall", period, limit,
    });
    // WOM may return more rows than requested; enforce the limit here.
    return rows.slice(0, limit).map(toGainer);
  }
}
