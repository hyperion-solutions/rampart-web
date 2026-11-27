import type { Member } from "@/modules/clan/domain/member";
import { formatDate, formatLabel, formatNumber, formatRelative, formatXp } from "@/shared/lib/format";
import { BUILD_LABELS } from "@/app/_components/labels";
import { AccountTypeIcon, RankIcon } from "@/app/_components/member-icons";
import { VerifiedBadge } from "@/app/_components/verified-accounts";

export function MemberTable({ members }: { members: readonly Member[] }) {
  return (
    <div className="pixel-box overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b-4 border-black bg-granite font-pixel text-pixel text-brass text-shadow-pixel">
          <tr>
            <th className="px-4 py-3 font-normal">Player</th>
            <th className="px-4 font-normal">Rank</th>
            <th className="hidden px-4 font-normal sm:table-cell">Build</th>
            <th className="px-4 text-right font-normal">Total XP</th>
            <th className="hidden px-4 text-right font-normal md:table-cell">EHP</th>
            <th className="hidden px-4 text-right font-normal md:table-cell">EHB</th>
            <th className="hidden px-4 font-normal lg:table-cell">Joined</th>
            <th className="hidden px-4 font-normal lg:table-cell">Last progressed</th>
          </tr>
        </thead>
        <tbody className="divide-y-4 divide-obsidian text-shadow-pixel">
          {members.map((m) => (
            <tr key={m.id} className="transition-colors hover:bg-rune/20">
              <td className="flex items-center gap-2 px-4 py-2">
                <a
                  href={m.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-pixel text-pixel text-limestone hover:text-lightning"
                >
                  <AccountTypeIcon member={m} />
                  {m.displayName}
                </a>
                <VerifiedBadge womPlayerId={m.id} />
              </td>
              <td className="px-4">
                <span className="flex items-center gap-2 whitespace-nowrap text-lightning">
                  <RankIcon member={m} />
                  {formatLabel(m.role)}
                </span>
              </td>
              <td className="hidden px-4 text-steel sm:table-cell">{formatLabel(m.build, BUILD_LABELS)}</td>
              <td className="px-4 text-right text-gain tabular-nums">{formatXp(m.totalExp)}</td>
              <td className="hidden px-4 text-right tabular-nums md:table-cell">{formatNumber(m.ehp)}</td>
              <td className="hidden px-4 text-right tabular-nums md:table-cell">{formatNumber(m.ehb)}</td>
              <td className="hidden whitespace-nowrap px-4 text-steel lg:table-cell">{formatDate(m.joinedAt)}</td>
              <td className="hidden whitespace-nowrap px-4 text-steel lg:table-cell">
                {m.lastProgressedAt ? formatRelative(m.lastProgressedAt) : "Never"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
