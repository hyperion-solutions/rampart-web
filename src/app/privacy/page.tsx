import Link from "next/link";
import { SectionHeading } from "@/shared/ui/section-heading";

export const metadata = { title: "Privacy | Rampart" };

/** Keep this in sync with what the accounts module stores (docs/decisions/0001-account-linking.md). */
const stored = [
  {
    what: "Your Discord id, name and avatar",
    why: "To know who you are when you sign in, and to show your name and picture.",
  },
  {
    what: "Your linked RSNs, their account type and Wise Old Man player id",
    why: "To show your accounts and stats, and the Verified badge on the members page.",
  },
  {
    what: "Dink's account hash for each linked account",
    why: "A code Dink gives each game account. It stays the same when you change your name, so your link follows you.",
  },
  {
    what: "When Dink last saw each account, and the last result of your Dink link",
    why: "To show “Linked Qphy” or why an account wasn't linked.",
  },
  {
    what: "Link requests you send to admins",
    why: "The RSN you asked for, when, and whether an admin approved it, so admins can review it and you can see the result.",
  },
  {
    what: "Which bingo team you're on, and the drops you get for your team",
    why: "To run clan bingo events and show the board, scoreboard and who got each drop (your Discord name and RSN). Drops are added by an admin or your team's captain, or reported by Dink while a board is running: then we keep the item, how many, what dropped it, and a smaller copy of Dink's screenshot if it sent one. Screenshots are kept only for drops that count, can be opened by anyone with their link (we only show it to signed-in members), and are deleted 30 days after the board finishes. If you delete your data, your name and RSN are removed from bingo history; your team keeps its points.",
  },
  {
    what: "A scrambled copy (hash) of your Dink link",
    why: "To recognise your link when Dink uses it. The link itself isn't stored, so it can't be read back.",
  },
] as const;

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <SectionHeading eyebrow="Rampart website" title="Privacy" />

      {deleted && (
        <p role="status" className="bg-gain/15 px-4 py-3 text-limestone text-shadow-pixel">
          Your data has been deleted and you&apos;ve been signed out.
        </p>
      )}

      <p className="text-steel text-shadow-pixel">
        This site is run by Rampart clan members for the clan. We keep as little as we can, and you can delete all of it
        yourself at any time.
      </p>

      <section className="pixel-box space-y-4 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">What we store, and why</h2>
        <dl className="space-y-4">
          {stored.map((item) => (
            <div key={item.what}>
              <dt className="font-pixel text-pixel text-limestone text-shadow-pixel">{item.what}</dt>
              <dd className="mt-1 text-steel text-shadow-pixel">{item.why}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pixel-box space-y-3 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">What we don&apos;t store</h2>
        <ul className="list-inside list-disc space-y-1 text-steel text-shadow-pixel">
          <li>Your email address or any password. Discord never shares them with us.</li>
          <li>Your game login. Dink never sends it.</li>
          <li>The full messages Dink sends: we keep only the fields listed above.</li>
        </ul>
      </section>

      <section className="pixel-box space-y-3 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">While you&apos;re signed in</h2>
        <p className="text-steel text-shadow-pixel">
          Your browser keeps an encrypted sign-in cookie for up to 7 days. It holds your clan rank and a Discord access
          key, used only to check once a day that you still have a rank in the Rampart Discord. Signing out removes it.
        </p>
      </section>

      <section className="pixel-box space-y-3 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Who else is involved</h2>
        <ul className="list-inside list-disc space-y-1 text-steel text-shadow-pixel">
          <li>Discord, for signing in and checking your rank.</li>
          <li>Wise Old Man, for public clan stats. These are already public on their site.</li>
          <li>Dink, the RuneLite plugin, sends data only to the address you paste into it.</li>
          <li>
            Vercel hosts the site and Neon hosts the database. Like most hosts, Vercel keeps short-lived request logs,
            which can include the address of your Dink link. If you think your link leaked, create a new one.
          </li>
        </ul>
        <p className="text-steel text-shadow-pixel">Rampart is a fan site and isn&apos;t affiliated with Jagex.</p>
      </section>

      <section className="pixel-box space-y-3 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Your choices</h2>
        <ul className="list-inside list-disc space-y-1 text-steel text-shadow-pixel">
          <li>Unlink any account on My account.</li>
          <li>Turn off or replace your Dink link on the Link your account page.</li>
          <li>
            Delete everything with <strong className="text-limestone">Delete my data</strong> on{" "}
            <Link href="/account" className="text-brass hover:text-limestone">
              My account
            </Link>
            . It removes your profile, linked accounts, link requests, bingo team places and Dink link straight away.
          </li>
          <li>
            Remove the site&apos;s access in Discord: User Settings, then Authorized Apps.
          </li>
        </ul>
        <p className="text-steel text-shadow-pixel">Questions? Ask an admin in the Rampart Discord.</p>
      </section>
    </article>
  );
}
