import Link from "next/link";
import { container } from "@/composition/container";
import { requireMember } from "@/composition/require-admin";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";

export const metadata = { title: "Bingo | Rampart" };
export const dynamic = "force-dynamic";

export default async function BingoPage() {
  await requireMember("/bingo");
  const boards = await container.bingo.listBoards.execute({ includeDrafts: false });
  const live = boards.filter((b) => b.status === "live");
  const finished = boards.filter((b) => b.status === "finished");

  const list = (items: typeof boards) => (
    <ul className="space-y-3">
      {items.map((b) => (
        <li key={b.id}>
          <Link href={`/bingo/${b.id}`} className="pixel-box block p-5 hover:[--edge:var(--color-rune)]">
            <p className="font-pixel text-pixel text-limestone text-shadow-pixel">{b.title}</p>
            <p className="text-steel text-shadow-pixel">
              {b.size}×{b.size} · {formatDateTime(b.startsAt)} to {formatDateTime(b.endsAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="mx-auto max-w-4xl space-y-10">
      <div>
        <SectionHeading eyebrow="Clan events" title="Bingo" />
        {live.length === 0 ? (
          <p className="pixel-box p-6 text-steel text-shadow-pixel">
            No bingo running right now. Watch the Rampart Discord for the next one.
          </p>
        ) : (
          list(live)
        )}
      </div>
      {finished.length > 0 && (
        <div>
          <h2 className="mb-4 font-quill text-pixel-2x text-lightning text-shadow-pixel">Past boards</h2>
          {list(finished)}
        </div>
      )}
    </section>
  );
}
