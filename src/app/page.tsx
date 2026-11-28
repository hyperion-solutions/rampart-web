import Image from "next/image";
import Link from "next/link";
import { StormBackdrop } from "@/app/_components/storm-backdrop";
import { TopGainers } from "@/app/_components/top-gainers";
import { container } from "@/composition/container";
import { formatNumber } from "@/shared/lib/format";
import { DiscordButton } from "@/shared/ui/discord-button";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Stat } from "@/shared/ui/stat";

export const revalidate = 300;

const pillars = [
  {
    title: "1-45 Defence ironmen",
    body: "Every member is an ironman with Defence at 45 or below. No trading, no handouts: every drop is earned.",
  },
  {
    title: "You name it, we do it",
    body: "PvM, PvP, raids, wilderness bossing and bingo. There is always a team heading out.",
  },
  {
    title: "Have fun, get the drops",
    body: "Keep it friendly and keep it clean: no illegal sites and no service Discords.",
  },
] as const;

const joinSteps = [
  { title: "Join the Discord", body: "Use the invite below to join the Rampart server." },
  { title: "Get full access", body: "React with the green check in the welcome channel, then set your display name to your in-game name." },
  { title: "Pick your roles", body: "Choose roles like @Raiders to get pinged for raids, wilderness bossing and group PvM." },
] as const;

/** What members can do on the site. `href` null = not built yet. */
const onTheSite = [
  {
    title: "Link your accounts",
    body: "Sign in with Discord and link your RSNs with the Dink plugin: log in once and it's done. No passwords or codes.",
    href: "/account/link",
    cta: "Link your account",
  },
  {
    title: "Clan bingo",
    body: "Team boards with real drops. With Dink, drops count by themselves, screenshot included, and the board updates live.",
    href: "/bingo",
    cta: "See the boards",
  },
  {
    title: "Events calendar",
    body: "Upcoming competitions, bossing trips and skilling nights in one place.",
    href: null,
    cta: null,
  },
] as const;

export default async function HomePage() {
  const [clan, gainers] = await Promise.all([
    container.getClanOverview.execute(),
    container.getTopGainers.execute("week", 5),
  ]);
  const totalEhp = clan.members.reduce((sum, m) => sum + m.ehp, 0);
  const totalEhb = clan.members.reduce((sum, m) => sum + m.ehb, 0);

  return (
    <div className="space-y-24">
      <section className="relative isolate pt-4 text-center">
        <StormBackdrop />
        <div className="storm mx-auto max-w-[560px]">
          <Image
            src="/brand/rampart-crest.webp"
            alt="Rampart clan crest: a storm-lit castle behind four helms, with the words 1-45 Defence Irons"
            width={1254}
            height={1254}
            priority
            sizes="(min-width: 640px) 520px, 90vw"
            className="crest mx-auto w-full max-w-[520px]"
          />
        </div>
        <h1 className="sr-only">{clan.name}</h1>
        <p className="mx-auto mt-4 max-w-prose text-limestone text-shadow-pixel">
          {clan.description ?? "An Old School RuneScape clan for 1-45 Defence ironmen. Hold the wall. Level up together."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <DiscordButton />
          <Link href="/members" className="pixel-btn bg-granite text-brass">
            Meet the members
          </Link>
        </div>
        <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Members" value={formatNumber(clan.members.length)} />
          <Stat label="Combined EHP" value={formatNumber(totalEhp)} />
          <Stat label="Combined EHB" value={formatNumber(totalEhb)} />
          <Stat label="Home world" value={clan.homeworld ? String(clan.homeworld) : "None"} />
        </dl>
      </section>

      <section>
        <SectionHeading eyebrow="The clan" title="Who we are" />
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <article key={p.title} className="pixel-box p-5">
              <h3 className="font-pixel text-pixel text-brass text-shadow-pixel">{p.title}</h3>
              <p className="mt-2 text-steel text-shadow-pixel">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="join" className="scroll-mt-24">
        <SectionHeading eyebrow="New here?" title="How to join" />
        <ol className="grid gap-4 md:grid-cols-3">
          {joinSteps.map((step, i) => (
            <li key={step.title} className="pixel-box flex gap-4 p-5">
              <span className="w-6 shrink-0 font-pixel text-pixel-2x text-lightning text-shadow-pixel">{i + 1}</span>
              <div>
                <h3 className="font-pixel text-pixel text-brass text-shadow-pixel">{step.title}</h3>
                <p className="mt-2 text-steel text-shadow-pixel">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 text-center">
          <DiscordButton />
        </div>
      </section>

      <section id="gains" className="scroll-mt-24">
        <SectionHeading eyebrow="Last 7 days" title="Top XP this week" />
        {gainers.length === 0 ? (
          <p className="pixel-box p-5 text-steel">
            No gains tracked yet. Update members on Wise Old Man to see them here.
          </p>
        ) : (
          <TopGainers gainers={gainers} />
        )}
      </section>

      <section>
        <SectionHeading eyebrow="Members" title="On the site" />
        <div className="grid gap-4 md:grid-cols-3">
          {onTheSite.map((f) => (
            <article key={f.title} className="pixel-box relative flex flex-col p-5">
              {!f.href && (
                <span className="absolute top-4 right-4 font-pixel text-pixel text-lightning text-shadow-pixel">Soon</span>
              )}
              <h3 className="font-pixel text-pixel text-brass text-shadow-pixel">{f.title}</h3>
              <p className="mt-2 flex-1 text-steel text-shadow-pixel">{f.body}</p>
              {f.href && (
                <Link href={f.href} className="mt-4 font-pixel text-pixel text-lightning text-shadow-pixel hover:text-limestone">
                  {f.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
