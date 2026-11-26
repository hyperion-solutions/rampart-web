import Image from "next/image";
import Link from "next/link";
import { container } from "@/composition/container";
import { formatNumber, formatXp } from "@/shared/lib/format";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Stat } from "@/shared/ui/stat";

export const revalidate = 300;

const pillars = [
  { title: "Ironman only", body: "Every member plays an ironman. No trading, no handouts, everything earned." },
  { title: "Defence capped at 45", body: "We build pures with staying power: 1 to 45 Defence, and it stays there." },
  { title: "Hold the wall together", body: "Raids, bossing, skilling nights and clan events. Nobody climbs alone." },
] as const;

const comingSoon = [
  { title: "Link your account", body: "Sign in and connect your RSN to track your progress on the clan page." },
  { title: "Clan bingo", body: "Team boards with drops and challenges. Mark tiles and race other teams." },
  { title: "Events calendar", body: "See upcoming competitions, bossing trips and skilling nights in one place." },
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
      <section className="pt-4 text-center">
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
          <Link href="/members" className="pixel-btn bg-rune text-white">
            Meet the members
          </Link>
          <a href="#gains" className="pixel-btn bg-granite text-brass">
            See this week&apos;s gains
          </a>
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

      <section id="gains" className="scroll-mt-24">
        <SectionHeading eyebrow="Last 7 days" title="Top XP this week" />
        {gainers.length === 0 ? (
          <p className="pixel-box p-5 text-steel">
            No gains tracked yet. Update members on Wise Old Man to see them here.
          </p>
        ) : (
          <ol className="pixel-box divide-y-4 divide-obsidian">
            {gainers.map((g, i) => (
              <li key={g.displayName} className="flex items-center gap-4 px-5 py-3">
                <span className={`w-10 font-pixel text-pixel-2x text-shadow-pixel ${i === 0 ? "text-brass" : "text-steel"}`}>
                  {i + 1}
                </span>
                <span className="flex-1 font-pixel text-pixel text-limestone text-shadow-pixel">{g.displayName}</span>
                <span className="font-pixel text-pixel text-gain text-shadow-pixel">+{formatXp(g.gained)} xp</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <SectionHeading eyebrow="On the way" title="Coming soon" />
        <div className="grid gap-4 md:grid-cols-3">
          {comingSoon.map((f) => (
            <article key={f.title} className="pixel-box relative p-5">
              <span className="absolute top-4 right-4 font-pixel text-pixel text-lightning text-shadow-pixel">Soon</span>
              <h3 className="font-pixel text-pixel text-brass text-shadow-pixel">{f.title}</h3>
              <p className="mt-2 text-steel text-shadow-pixel">{f.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
