import Link from "next/link";
import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";
import { formatDateTime } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { StatusBadge } from "./_components/status-badge";

export const metadata = { title: "Bingo boards | Rampart" };
export const dynamic = "force-dynamic";

export default async function AdminBingoPage() {
  await requireAdmin("/admin/bingo");
  const boards = await container.bingo.listBoards.execute({ includeDrafts: true });

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Admin" title="Bingo boards" />
        <Link href="/admin/bingo/new" className="pixel-btn mb-6 bg-rune text-white">
          Create board
        </Link>
      </div>

      {boards.length === 0 ? (
        <p className="pixel-box p-6 text-steel text-shadow-pixel">No boards yet. Create one to start planning a bingo.</p>
      ) : (
        <ul className="space-y-3">
          {boards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bingo/${b.id}`}
                className="pixel-box flex flex-wrap items-center justify-between gap-4 p-5 hover:[--edge:var(--color-rune)]"
              >
                <div>
                  <p className="font-pixel text-pixel text-limestone text-shadow-pixel">{b.title}</p>
                  <p className="text-steel text-shadow-pixel">
                    {b.size}×{b.size} · {formatDateTime(b.startsAt)} to {formatDateTime(b.endsAt)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
