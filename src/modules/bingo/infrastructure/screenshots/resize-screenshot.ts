import "server-only";
import sharp from "sharp";

/** Full view: wide enough to read the drop and chat box, small enough to load fast. */
const FULL_WIDTH = 1280;
const THUMBNAIL_WIDTH = 320;

/**
 * Turns Dink's PNG or JPEG into two WebP files: about 100–200 KB and about 15 KB.
 * Never upscales. Strips metadata (sharp drops it unless asked to keep it).
 */
export async function resizeScreenshot(image: Uint8Array): Promise<{ full: Buffer; thumbnail: Buffer }> {
  const source = sharp(image, { failOn: "error" });
  const [full, thumbnail] = await Promise.all([
    source.clone().resize({ width: FULL_WIDTH, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer(),
    source.clone().resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer(),
  ]);
  return { full, thumbnail };
}
