import Link from "next/link";
import { DropScreenshot } from "@/app/_components/drop-screenshot";
import { teamSwatch } from "@/app/_components/team-colour";
import type { MyBingo } from "@/modules/bingo/application/get-my-bingo";

const ordinal = (n: number) => {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
};

/** The member's current (or last) bingo: team, place, what they contributed, latest drop pictures. */
export function YourBingo({ bingo }: { bingo: MyBingo | null }) {
  if (!bingo) {
    return (
      <div className="pixel-box space-y-2 p-6">
        <h2 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Your bingo</h2>
        <p className="text-steel text-shadow-pixel">
          You&apos;re not on a bingo team yet. Ask an admin to add you, or see the{" "}
          <Link href="/bingo" className="text-brass hover:text-limestone">
            boards
          </Link>
          .
        </p>
      </div>
    );
  }

  const { board, team } = bingo;
  const stats = [
    { label: "Place", value: `${ordinal(bingo.place)} of ${bingo.teams}` },
    { label: "Team points", value: `${bingo.teamPoints} / ${bingo.maxPoints}` },
    { label: "Your drops", value: String(bingo.myDrops) },
    { label: "Tiles you finished", value: bingo.myTiles > 0 ? `${bingo.myTiles} (${bingo.myPoints} pts)` : "0" },
  ];

  return (
    <div className="pixel-box space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-pixel text-pixel text-steel text-shadow-pixel">
            Your bingo · {board.status === "finished" ? "Finished" : "Live"}
          </p>
          <Link href={`/bingo/${board.id}`} className="font-quill text-pixel-2x text-lightning text-shadow-pixel hover:text-limestone">
            {board.title}
          </Link>
        </div>
        <p className="flex items-center gap-2 font-pixel text-pixel text-limestone text-shadow-pixel">
          <span className={`size-4 border-2 border-black ${teamSwatch(team.colour)}`} aria-hidden />
          {team.name}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse items-center bg-obsidian/60 px-3 py-3 text-center">
            <dt className="font-pixel text-pixel text-steel text-shadow-pixel">{s.label}</dt>
            <dd className="font-pixel text-pixel text-gain text-shadow-pixel">{s.value}</dd>
          </div>
        ))}
      </dl>

      {bingo.screenshots.length > 0 && (
        <div>
          <p className="font-pixel text-pixel text-brass text-shadow-pixel">Your latest drops</p>
          <ul className="mt-1 flex flex-wrap gap-3">
            {bingo.screenshots.map((s) => (
              <li key={s.url}>
                <DropScreenshot url={s.url} thumbnailUrl={s.thumbnailUrl} label={s.tileName} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
