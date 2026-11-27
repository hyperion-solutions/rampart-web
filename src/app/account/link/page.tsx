import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/composition/auth";
import { container } from "@/composition/container";
import type { LinkAttempt } from "@/modules/accounts/domain/link-token";
import { formatRelative } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { turnOffLink } from "./actions";
import { AutoRefresh } from "./_components/auto-refresh";
import { CreateLinkForm } from "./_components/create-link-form";
import { ManualLinkForm } from "./_components/manual-link-form";

export const metadata = { title: "Link your account | Rampart" };
export const dynamic = "force-dynamic";

const steps = [
  { title: "Install Dink", body: "In RuneLite, open the Plugin Hub, search for \"Dink\" and install it." },
  { title: "Create your link", body: "Use the button below. Copy the address it gives you." },
  {
    title: "Paste it into Dink",
    body: "Open Dink's settings, then Advanced, and paste the address into Custom Metadata Handler. Also tick Send Clan Name.",
  },
  { title: "Log in to the game", body: "Log out and back in. After a few seconds this page shows the account you linked." },
  { title: "Link your alts", body: "Log in on your other clan accounts with the same Dink settings. Each one links to you." },
] as const;

function attemptMessage({ rsn, outcome }: LinkAttempt): { tone: "ok" | "warn"; text: string } {
  switch (outcome) {
    case "linked":
      return { tone: "ok", text: `Linked ${rsn}.` };
    case "updated":
      return { tone: "ok", text: `${rsn} is linked to you. Seen again.` };
    case "not-in-clan":
      return {
        tone: "warn",
        text: `${rsn} isn't in the Rampart clan on Wise Old Man, so it wasn't linked. Only clan accounts can be linked.`,
      };
    case "owned-by-someone-else":
      return { tone: "warn", text: `${rsn} is already linked to another member. Ask an admin on Discord if it's yours.` };
  }
}

export default async function LinkAccountPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/signin?callbackUrl=/account/link");

  const [token, claims] = await Promise.all([
    container.getLinkToken.execute(userId),
    container.listMyClaims.execute(userId),
  ]);
  const attempt = token?.lastAttempt ?? null;
  const message = attempt ? attemptMessage(attempt) : null;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <SectionHeading eyebrow="My account" title="Link your account" />

      <p className="text-steel text-shadow-pixel">
        Link your RSNs by logging in to the game with the Dink RuneLite plugin. Dink tells us which account you logged in
        to, which proves it&apos;s yours. No passwords or codes needed. Only Rampart clan accounts can be linked.
      </p>

      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, i) => (
          <li key={step.title} className="pixel-box flex gap-4 p-4">
            <span className="w-6 shrink-0 font-pixel text-pixel-2x text-lightning text-shadow-pixel">{i + 1}</span>
            <div>
              <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">{step.title}</h2>
              <p className="mt-1 text-steel text-shadow-pixel">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="pixel-box space-y-4 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Your Dink link</h2>

        {token ? (
          <p className="text-steel text-shadow-pixel">
            Active since {formatRelative(token.createdAt)}.{" "}
            {token.lastUsedAt ? `Dink last reported in ${formatRelative(token.lastUsedAt)}.` : ""}
          </p>
        ) : (
          <p className="text-steel text-shadow-pixel">You don&apos;t have a Dink link yet.</p>
        )}

        {message && (
          <p
            role="status"
            className={`px-4 py-3 text-shadow-pixel ${message.tone === "ok" ? "bg-gain/15 text-limestone" : "bg-banner/30 text-limestone"}`}
          >
            {message.text}
          </p>
        )}

        {token && !attempt && (
          <p role="status" className="bg-rune/20 px-4 py-3 text-limestone text-shadow-pixel">
            Waiting for your login... Log out and back in to the game with your link in Dink.
            <AutoRefresh />
          </p>
        )}

        <CreateLinkForm hasLink={token !== null} />

        {token && (
          <form action={turnOffLink}>
            <button type="submit" className="font-pixel text-pixel text-steel underline-offset-4 text-shadow-pixel hover:text-limestone hover:underline">
              Turn off my link
            </button>
            <p className="text-steel text-shadow-pixel">Accounts you already linked stay linked.</p>
          </form>
        )}
      </div>

      <div className="pixel-box space-y-4 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Can&apos;t use Dink?</h2>
        <p className="text-steel text-shadow-pixel">
          Ask an admin to link your RSN instead. They&apos;ll check it&apos;s yours, usually by asking you on Discord. If you
          later log in with Dink, it&apos;s verified automatically.
        </p>
        <ManualLinkForm />
        {claims.length > 0 && (
          <ul className="divide-y-4 divide-obsidian">
            {claims.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{c.rsn}</span>
                <span
                  className={`font-pixel text-pixel text-shadow-pixel ${
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
        )}
      </div>

      <p className="text-steel text-shadow-pixel">
        Your link is personal: anyone with it can add accounts they log in to to your profile. If you think someone has
        it, create a new one. See your linked accounts on <Link href="/account" className="text-brass hover:text-limestone">My account</Link>.
      </p>
    </section>
  );
}
