"use client";

import { useState } from "react";
import { ItemPicker, type PickedItem } from "@/app/_components/item-picker";

/** Lets admins try the board editor's item picker against the catalog. */
export function ItemSearchDemo() {
  const [items, setItems] = useState<PickedItem[]>([]);
  return <ItemPicker value={items} onChange={setItems} />;
}
