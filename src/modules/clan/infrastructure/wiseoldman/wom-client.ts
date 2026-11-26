export interface WomClientOptions {
  baseUrl: string;
  userAgent: string;
  revalidateSeconds?: number;
}

/** Thin HTTP wrapper. Single responsibility: talk to the WOM API. */
export class WomClient {
  constructor(private readonly options: WomClientOptions) {}

  async get<T>(path: string, query: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${this.options.baseUrl}${path}`);
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const res = await fetch(url, {
      headers: { "User-Agent": this.options.userAgent },
      next: { revalidate: this.options.revalidateSeconds ?? 300 },
    });
    if (!res.ok) throw new Error(`Wise Old Man request failed (${res.status}) for ${url.pathname}`);
    return (await res.json()) as T;
  }
}
