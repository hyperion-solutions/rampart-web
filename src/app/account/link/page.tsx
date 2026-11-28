import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/composition/auth";
import { container } from "@/composition/container";
import { formatRelative } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { turnOffLink } from "./actions";
import { LinkWizard } from "./_components/link-wizard";

export const metadata = { title: "Link your account | Rampart" };
export const dynamic = "force-dynamic";

export default async function LinkAccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/signin?callbackUrl=/account/link");

  const [token, claims] = await Promise.all([
    container.getLinkToken.execute(userId),
    container.listMyClaims.execute(userId),
  ]);
  const attempt = token?.lastAttempt
    ? { rsn: token.lastAttempt.rsn, outcome: token.lastAttempt.outcome, at: token.lastAttempt.at.toISOString() }
    : null;

  const claimList =
    claims.length > 0 ? (
      <ul className="divide-y-4 divide-obsidian">
        {claims.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span className="font-pixel text-pixel text-limestone">{c.rsn}</span>
            <span
              className={`font-pixel text-pixel ${
                c.status === "approved" ? "text-gain" : c.status === "rejected" ? "text-banner" : "text-brass"
              }`}
            >
              {c.status === "pending"
                ? `Waiting for an admin (asked ${formatRelative(c.createdAt)})`
                : c.status === "approved"
                  ? "Approved"
                  : "Not approved: ask an admin on Discord"}
            </span>
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <SectionHeading eyebrow="My account" title="Link your account" />

      <LinkWizard hasLink={token !== null} attempt={attempt} claims={claimList} />

      <div className="pixel-box space-y-3 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Count your bingo drops automatically</h2>
        <p className="text-steel text-shadow-pixel">
          With the same link, Dink can report your drops. While a bingo board is running, drops on your team&apos;s tiles count
          by themselves, from any of your linked accounts.
        </p>
        <ol className="list-inside list-decimal space-y-1 text-limestone text-shadow-pixel">
          <li>In Dink&apos;s settings, paste your link into Primary Webhook URLs, on its own line. Keep any Discord webhooks already there.</li>
          <li>If the Loot section has its own address under Webhook Overrides, add your link there too: Dink then skips the primary list for loot.</li>
          <li>Turn on Loot.</li>
          <li>
            For a picture with each drop, keep Send Image on. Under Advanced, set Screenshot Scale to 50–75% (very large
            screenshots are rejected, and the drop with them) and turn on Hide Chat in Images.
          </li>
        </ol>
        <p className="text-steel text-shadow-pixel">
          Only drops between a board&apos;s start and end count, and we keep the picture only for drops that count. Admins
          and your captain can still add or undo drops by hand.
        </p>
        <details className="text-steel text-shadow-pixel">
          <summary className="cursor-pointer font-pixel text-pixel text-limestone">
            Optional: is your Min Loot Value above 0?
          </summary>
          <div className="mt-2 space-y-2">
            <p>
              Then Dink skips drops worth less than it, and cheap bingo items would be missed. To have them sent anyway, paste
              your link with <code className="font-body">/config</code> added at the end into Advanced, Dynamic Config URL. Dink
              then adds the items on current bingo boards to your Item Allowlist, and updates it each time it starts.
            </p>
            <p>
              To let finished boards&apos; items drop off, also tick Import Policy: Overwrite Item Lists. Skip that if you keep
              your own Item Allowlist, since it would be replaced.
            </p>
          </div>
        </details>
      </div>

      {token && (
        <div className="pixel-box space-y-2 p-6">
          <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Your Dink link</h2>
          <p className="text-steel text-shadow-pixel">
            Active since {formatRelative(token.createdAt)}.{" "}
            {token.lastUsedAt ? `Dink last reported in ${formatRelative(token.lastUsedAt)}.` : ""}
          </p>
          <form action={turnOffLink}>
            <button
              type="submit"
              className="font-pixel text-pixel text-steel underline-offset-4 text-shadow-pixel hover:text-limestone hover:underline"
            >
              Turn off my link
            </button>
            <p className="text-steel text-shadow-pixel">Accounts you already linked stay linked.</p>
          </form>
        </div>
      )}

      <p className="text-steel text-shadow-pixel">
        Your link is personal: anyone with it can add accounts they log in to to your profile. If you think someone has
        it, create a new one. See your linked accounts on{" "}
        <Link href="/account" className="text-brass hover:text-limestone">
          My account
        </Link>
        .
      </p>
      <p className="text-steel text-shadow-pixel">Bob the Cat chathead from the OSRS Wiki. Game art © Jagex.</p>
    </section>
  );
}
