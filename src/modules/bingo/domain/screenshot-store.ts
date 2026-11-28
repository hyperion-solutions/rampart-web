/** Where a stored drop screenshot can be seen: the resized image and a small thumbnail. */
export interface StoredScreenshot {
  readonly url: string;
  readonly thumbnailUrl: string;
}

/** Port: keeps resized screenshots of counted drops (docs/decisions/0005-drop-screenshots.md). */
export interface ScreenshotStore {
  /** Resizes and stores a screenshot (PNG or JPEG bytes). Throws if the image can't be read or stored. */
  save(image: Uint8Array): Promise<StoredScreenshot>;
}
