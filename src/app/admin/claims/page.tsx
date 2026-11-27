import { container } from "@/composition/container";
import { requireAdmin } from "@/composition/require-admin";
import { formatLabel, formatRelative } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { ACCOUNT_TYPE_LABELS } from "@/app/_components/labels";
import { decideClaim } from "./actions";

export const metadata = { title: "Link requests | Rampart" };
export const dynamic = "force-dynamic";

const WOM_PLAYER_URL = "https://wiseoldman.net/players/";

export default async function AdminClaimsPage() {
  await requireAdmin("/admin/claims");
  const claims = await container.listPendingClaims.execute();

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <SectionHeading eyebrow="Admin" title="Link requests" />
      <p className="text-steel text-shadow-pixel">
        Members who don&apos;t use Dink ask to link an RSN here. Check it&apos;s really theirs before approving, for
        example by asking them on Discord to show the account in game. Approved accounts get the Verified badge.
      </p>

      {claims.length === 0 ? (
        <p className="pixel-box p-6 text-steel text-shadow-pixel">No requests waiting. Nice.</p>
      ) : (
        <ul className="space-y-3">
          {claims.map((c) => (
            <li key={c.id} className="pixel-box flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <a
                  href={`${WOM_PLAYER_URL}${encodeURIComponent(c.rsn)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-pixel text-pixel text-limestone text-shadow-pixel hover:text-lightning"
                >
                  {c.rsn}
                </a>
                <p className="text-steel text-shadow-pixel">
                  {formatLabel(c.accountType, ACCOUNT_TYPE_LABELS)} · asked by{" "}
                  <span className="text-brass">{c.requesterName}</span> {formatRelative(c.createdAt)}
                </p>
              </div>
              <form action={decideClaim} className="flex gap-3">
                <input type="hidden" name="claimId" value={c.id} />
                <button type="submit" name="decision" value="approve" className="pixel-btn bg-rune text-white">
                  Approve
                </button>
                <button type="submit" name="decision" value="reject" className="pixel-btn bg-granite text-steel">
                  Reject
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
