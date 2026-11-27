import type { AccountOverview } from "@/modules/accounts/application/get-my-accounts-overview";
import { ACCOUNT_TYPE_LABELS, BUILD_LABELS } from "@/app/_components/labels";
import { AccountTypeIcon, RankIcon } from "@/app/_components/member-icons";
import { formatLabel, formatRelative, formatXp } from "@/shared/lib/format";
import { UnlinkButton } from "./unlink-button";

/** One linked account: in-game rank and stats from Wise Old Man, plus how it was linked. */
export function AccountCard({ overview: { account, member } }: { overview: AccountOverview }) {
  const verified =
    account.verifiedVia === "admin"
      ? "Approved by an admin"
      : account.lastSeenAt
        ? `Dink last saw it ${formatRelative(account.lastSeenAt)}`
        : "Verified with Dink";

  return (
    <article className="pixel-box flex flex-col gap-4 p-5">
      <header className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center bg-obsidian shadow-[inset_4px_4px_0_0_rgb(0_0_0/0.45)]">
          {member ? (
            <AccountTypeIcon member={member} scale={3} />
          ) : (
            <span className="font-pixel text-pixel-2x text-steel" aria-hidden>
              ?
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {member ? (
            <a
              href={member.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate font-pixel text-pixel text-limestone text-shadow-pixel hover:text-lightning"
            >
              {member.displayName}
            </a>
          ) : (
            <p className="truncate font-pixel text-pixel text-limestone text-shadow-pixel">{account.rsn}</p>
          )}
          {member ? (
            <p className="mt-1 flex items-center gap-2 font-pixel text-pixel text-brass text-shadow-pixel">
              <RankIcon member={member} />
              {formatLabel(member.role)}
            </p>
          ) : (
            <p className="mt-1 text-banner text-shadow-pixel">No longer in the Rampart clan</p>
          )}
        </div>
      </header>

      {member && (
        <>
          <p className="flex flex-wrap gap-2 font-pixel text-pixel text-shadow-pixel">
            <span className="bg-granite px-2 py-0.5 text-lightning">
              {formatLabel(member.accountType, ACCOUNT_TYPE_LABELS)}
            </span>
            <span className="bg-granite px-2 py-0.5 text-steel">{formatLabel(member.build, BUILD_LABELS)}</span>
          </p>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Total XP", value: formatXp(member.totalExp) },
              { label: "EHP", value: Math.round(member.ehp).toLocaleString("en-US") },
              { label: "EHB", value: Math.round(member.ehb).toLocaleString("en-US") },
            ].map((s) => (
              <div key={s.label} className="flex flex-col-reverse bg-obsidian/60 py-2">
                <dt className="font-pixel text-pixel text-steel text-shadow-pixel">{s.label}</dt>
                <dd className="font-pixel text-pixel text-gain text-shadow-pixel">{s.value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t-4 border-obsidian pt-3">
        <span className="text-steel text-shadow-pixel">{verified}</span>
        <UnlinkButton accountId={account.id} rsn={member?.displayName ?? account.rsn} />
      </footer>
    </article>
  );
}
