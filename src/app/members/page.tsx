import { container } from "@/composition/container";
import { formatNumber } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";

export const revalidate = 300;
export const metadata = { title: "Members | Rampart" };

export default async function MembersPage() {
  const clan = await container.getClanOverview.execute();
  const members = [...clan.members].sort((a, b) => b.ehp - a.ehp);

  return (
    <section>
      <SectionHeading eyebrow={`${formatNumber(members.length)} defenders`} title="Members" />
      <div className="pixel-box overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b-4 border-black bg-granite font-pixel text-pixel text-brass text-shadow-pixel">
            <tr>
              <th className="px-4 py-3 font-normal">Player</th>
              <th className="px-4 font-normal">Rank</th>
              <th className="px-4 font-normal">Type</th>
              <th className="px-4 text-right font-normal">EHP</th>
              <th className="px-4 text-right font-normal">EHB</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-obsidian text-shadow-pixel">
            {members.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-rune/20">
                <td className="px-4 py-2.5 font-pixel text-pixel text-limestone">{m.displayName}</td>
                <td className="px-4 capitalize text-lightning">{m.role}</td>
                <td className="px-4 capitalize text-steel">{m.accountType}</td>
                <td className="px-4 text-right tabular-nums">{formatNumber(m.ehp)}</td>
                <td className="px-4 text-right tabular-nums">{formatNumber(m.ehb)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
