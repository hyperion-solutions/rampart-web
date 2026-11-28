import "server-only";
import { randomUUID } from "node:crypto";
import { del, list, put } from "@vercel/blob";
import type { ScreenshotStore, StoredScreenshot } from "../../domain/screenshot-store";
import { resizeScreenshot } from "./resize-screenshot";

/** Cached by the CDN and browsers: a screenshot never changes (new ones get new paths). */
const ONE_YEAR_S = 365 * 24 * 60 * 60;
const PREFIX = "bingo/drops/";
/** Blob's delete takes batches; keep requests small. */
const DELETE_BATCH = 100;

/**
 * Adapter: resized screenshots in a public Vercel Blob store (docs/decisions/0005). Paths are
 * random and unguessable. Authenticates with the store id and the function's Vercel OIDC token.
 */
export class VercelBlobScreenshotStore implements ScreenshotStore {
  constructor(private readonly storeId: string) {}

  async save(image: Uint8Array): Promise<StoredScreenshot> {
    const { full, thumbnail } = await resizeScreenshot(image);
    const id = randomUUID();
    const options = {
      access: "public" as const,
      contentType: "image/webp",
      cacheControlMaxAge: ONE_YEAR_S,
      storeId: this.storeId,
    };
    const [fullBlob, thumbBlob] = await Promise.all([
      put(`${PREFIX}${id}.webp`, full, options),
      put(`${PREFIX}${id}-thumb.webp`, thumbnail, options),
    ]);
    return { url: fullBlob.url, thumbnailUrl: thumbBlob.url };
  }

  async delete(urls: readonly string[]): Promise<void> {
    for (let i = 0; i < urls.length; i += DELETE_BATCH) {
      await del(urls.slice(i, i + DELETE_BATCH), { storeId: this.storeId });
    }
  }

  async listStored(): Promise<{ url: string; uploadedAt: Date }[]> {
    const found: { url: string; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      // Each page is one Blob operation; 1,000 per page keeps the daily clean-up to a few.
      const page = await list({ prefix: PREFIX, limit: 1000, cursor, storeId: this.storeId });
      found.push(...page.blobs.map((b) => ({ url: b.url, uploadedAt: b.uploadedAt })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return found;
  }
}
