import Link from "next/link";
import { requireAdmin } from "@/composition/require-admin";
import { SectionHeading } from "@/shared/ui/section-heading";
import { createBoardAction } from "../actions";
import { BoardForm } from "../_components/board-form";

export const metadata = { title: "Create a bingo board | Rampart" };

export default async function NewBoardPage() {
  await requireAdmin("/admin/bingo/new");
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <SectionHeading eyebrow="Admin · Bingo" title="Create a board" />
      <div className="pixel-box p-6">
        <BoardForm action={createBoardAction} submitLabel="Create board" />
      </div>
      <p className="text-steel text-shadow-pixel">
        It starts as a draft: only admins see it until you publish it. Next you&apos;ll fill the squares.{" "}
        <Link href="/admin/bingo" className="text-brass hover:text-limestone">
          Back to boards
        </Link>
      </p>
    </section>
  );
}
