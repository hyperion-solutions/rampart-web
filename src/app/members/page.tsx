import { container } from "@/composition/container";
import { formatNumber } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { LeaderCard } from "./_components/leader-card";
import { MemberTable } from "./_components/member-table";

export const revalidate = 300;
export const metadata = { title: "Members | Rampart" };

/** Top ranks get a gold frame. */
const HIGHLIGHT_RANKS = new Set(["owner", "deputy_owner"]);

export default async function MembersPage() {
  const roster = await container.getClanRoster.execute();

  return (
    <div className="space-y-16">
      <section>
        <SectionHeading eyebrow={`${formatNumber(roster.total)} defenders`} title="Leadership" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roster.leadership.flatMap((group) =>
            group.members.map((m) => <LeaderCard key={m.id} member={m} highlight={HIGHLIGHT_RANKS.has(group.rank)} />),
          )}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Sorted by rank, then total XP" title="Members" />
        <MemberTable members={roster.members} />
      </section>
    </div>
  );
}
