import "server-only";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import type { ScreenshotStore, StoredScreenshot } from "../../domain/screenshot-store";
import { resizeScreenshot } from "./resize-screenshot";

/** Cached by the CDN and browsers: a screenshot never changes (new ones get new paths). */
const ONE_YEAR_S = 365 * 24 * 60 * 60;

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
      put(`bingo/drops/${id}.webp`, full, options),
      put(`bingo/drops/${id}-thumb.webp`, thumbnail, options),
    ]);
    return { url: fullBlob.url, thumbnailUrl: thumbBlob.url };
  }
}
