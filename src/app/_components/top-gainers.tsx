import Image from "next/image";
import type { TopGainer } from "@/modules/clan/domain/clan";
import { formatLabel, formatXp } from "@/shared/lib/format";
import { BUILD_LABELS } from "./labels";
import { AccountTypeIcon, RankIcon } from "./member-icons";

/** Ranked list of XP gainers. The top gainer gets the crown and a gold frame. */
export function TopGainers({ gainers }: { gainers: readonly TopGainer[] }) {
  const top = gainers[0]?.gained ?? 1;

  return (
    <ol className="space-y-3">
      {gainers.map(({ member, gained }, i) => {
        const first = i === 0;
        const share = Math.max(4, Math.round((gained / top) * 100));
        return (
          <li
            key={member.id}
            className={`pixel-box grid grid-cols-[3.5rem_1fr] items-center gap-x-4 gap-y-3 px-4 py-3 sm:grid-cols-[3.5rem_minmax(0,16rem)_1fr_auto] ${
              first ? "[--edge:var(--color-brass)]" : ""
            }`}
          >
            <span className="row-span-2 grid place-items-center sm:row-span-1">
              {first ? (
                <Image src="/icons/crown.png" alt="Top gainer" width={52} height={54} className="pixelated" />
              ) : (
                <span className="font-pixel text-pixel-2x text-steel text-shadow-pixel">{i + 1}</span>
              )}
            </span>

            <div className="flex min-w-0 items-center gap-3">
              <AccountTypeIcon member={member} />
              <div className="min-w-0">
                <a
                  href={member.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block truncate font-pixel text-pixel text-shadow-pixel hover:text-lightning ${
                    first ? "text-brass" : "text-limestone"
                  }`}
                >
                  {member.displayName}
                </a>
                <p className="flex items-center gap-2 whitespace-nowrap text-steel text-shadow-pixel">
                  <RankIcon member={member} scale={1} />
                  {formatLabel(member.role)} · {formatLabel(member.build, BUILD_LABELS)}
                </p>
              </div>
            </div>

            {/* XP bar relative to the top gainer: a stepped pixel bar, no gradients. */}
            <div
              className="col-start-2 h-4 bg-obsidian shadow-[inset_2px_2px_0_0_rgb(0_0_0/0.6)] sm:col-start-auto"
              role="presentation"
            >
              <div
                className="h-full bg-gain shadow-[inset_0_-4px_0_0_rgb(0_0_0/0.3),inset_0_2px_0_0_rgb(255_255_255/0.35)]"
                style={{ width: `${share}%` }}
              />
            </div>

            <div className="col-start-2 flex justify-between gap-4 text-right sm:col-start-auto sm:block">
              <p className="font-pixel text-pixel text-gain text-shadow-pixel">+{formatXp(gained)} xp</p>
              <p className="text-steel text-shadow-pixel">{formatXp(member.totalExp)} total</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
