import { requireAdmin } from "@/composition/require-admin";
import { SectionHeading } from "@/shared/ui/section-heading";
import { ItemSearchDemo } from "./item-search-demo";

export const metadata = { title: "Item catalog | Rampart" };

export default async function AdminItemsPage() {
  await requireAdmin("/admin/items");

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <SectionHeading eyebrow="Admin" title="Item catalog" />
      <p className="text-steel text-shadow-pixel">
        Every OSRS item, including pets and other untradeables, refreshed every Thursday after the game update. This is
        the search the bingo board editor uses: try it, and pick a few items.
      </p>
      <div className="pixel-box p-6">
        <ItemSearchDemo />
      </div>
    </section>
  );
}
