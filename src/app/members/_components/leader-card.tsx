import type { Member } from "@/modules/clan/domain/member";
import { formatDate, formatLabel, formatRelative, formatXp } from "@/shared/lib/format";
import { ACCOUNT_TYPE_LABELS, BUILD_LABELS } from "@/app/_components/labels";
import { AccountTypeIcon, RankIcon } from "@/app/_components/member-icons";
import { VerifiedBadge } from "@/app/_components/verified-accounts";

export function LeaderCard({ member, highlight = false }: { member: Member; highlight?: boolean }) {
  const stats = [
    { label: "Total XP", value: formatXp(member.totalExp) },
    { label: "EHP", value: Math.round(member.ehp).toLocaleString("en-US") },
    { label: "EHB", value: Math.round(member.ehb).toLocaleString("en-US") },
  ];

  return (
    <article className={`pixel-box flex flex-col gap-4 p-5 ${highlight ? "[--edge:var(--color-brass)]" : ""}`}>
      <header className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center bg-obsidian shadow-[inset_4px_4px_0_0_rgb(0_0_0/0.45)]">
          <AccountTypeIcon member={member} scale={3} />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <a
              href={member.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-pixel text-pixel text-limestone text-shadow-pixel hover:text-lightning"
            >
              {member.displayName}
            </a>
            <VerifiedBadge womPlayerId={member.id} />
          </div>
          <p className="mt-1 flex items-center gap-2 font-pixel text-pixel text-brass text-shadow-pixel">
            <RankIcon member={member} />
            {formatLabel(member.role)}
          </p>
        </div>
      </header>

      <p className="flex flex-wrap gap-2 font-pixel text-pixel text-shadow-pixel">
        <span className="bg-granite px-2 py-0.5 text-lightning">{formatLabel(member.accountType, ACCOUNT_TYPE_LABELS)}</span>
        <span className="bg-granite px-2 py-0.5 text-steel">{formatLabel(member.build, BUILD_LABELS)}</span>
      </p>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse bg-obsidian/60 py-2">
            <dt className="font-pixel text-pixel text-steel text-shadow-pixel">{s.label}</dt>
            <dd className="font-pixel text-pixel text-gain text-shadow-pixel">{s.value}</dd>
          </div>
        ))}
      </dl>

      <footer className="flex flex-wrap justify-between gap-x-4 text-steel text-shadow-pixel">
        <span>Joined {formatDate(member.joinedAt)}</span>
        {member.lastProgressedAt && <span>Progressed {formatRelative(member.lastProgressedAt)}</span>}
      </footer>
    </article>
  );
}
