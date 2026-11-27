/** Port: random items for filling squares. Implemented by the items module, wired in the container. */
export interface RandomItemSource {
  /** Up to `count` different items, in random order. */
  pick(count: number): Promise<readonly { readonly id: number; readonly name: string }[]>;
}
