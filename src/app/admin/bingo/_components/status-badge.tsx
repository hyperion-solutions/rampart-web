import type { BoardStatus } from "@/modules/bingo/domain/board";

const STYLES: Readonly<Record<BoardStatus, string>> = {
  draft: "bg-granite text-steel",
  live: "bg-gain/20 text-gain",
  finished: "bg-rune/20 text-lightning",
};

const LABELS: Readonly<Record<BoardStatus, string>> = { draft: "Draft", live: "Live", finished: "Finished" };

export function StatusBadge({ status }: { status: BoardStatus }) {
  return <span className={`px-2 py-0.5 font-pixel text-pixel text-shadow-pixel ${STYLES[status]}`}>{LABELS[status]}</span>;
}
