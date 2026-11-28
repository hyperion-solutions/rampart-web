import Image from "next/image";
import Link from "next/link";
import { formatRelative } from "@/shared/lib/format";

/** Where the member's Dink setup stands, from their personal link. */
export type DinkStatus = { readonly kind: "none" } | { readonly kind: "waiting" } | { readonly kind: "seen"; readonly at: Date };

/**
 * The top of My account, like an OSRS character screen: framed avatar, name, Discord rank, Dink
 * status, and Crob the crab keeping watch. Crob: OSRS Wiki animation (Crob.gif), game art © Jagex;
 * still frame for reduced motion.
 */
export function CharacterPanel({
  name,
  image,
  rank,
  rankIconUrl,
  linkedCount,
  dink,
  actions,
}: {
  name: string;
  image: string | null;
  rank: string | null;
  rankIconUrl: string | null;
  linkedCount: number;
  dink: DinkStatus;
  /** Buttons on the right, e.g. Sign out. */
  actions: React.ReactNode;
}) {
  return (
    <div className="pixel-box relative overflow-hidden p-6">
      <div className="flex flex-wrap items-center gap-6 pr-0 sm:pr-24">
        <div className="shrink-0 border-4 border-black bg-obsidian p-1 shadow-[inset_0_0_0_2px_var(--color-mortar)]">
          {image ? (
            <Image src={image} alt="" width={96} height={96} className="block size-24" />
          ) : (
            <span className="block size-24 bg-granite" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-quill text-pixel-2x text-limestone text-shadow-pixel">{name}</p>
          <p className="flex items-center gap-2 text-steel text-shadow-pixel">
            {rankIconUrl && (
              // The rank's Discord role icon (public/icons/ranks), served as the original PNG.
              <Image src={rankIconUrl} alt="" width={24} height={24} unoptimized />
            )}
            <span className="font-pixel text-pixel text-brass">{rank ?? "Member"}</span>
            <span>in the Rampart Discord</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="neutral">
              {linkedCount === 0 ? "No accounts linked" : `${linkedCount} account${linkedCount === 1 ? "" : "s"} linked`}
            </Pill>
            <DinkPill dink={dink} />
          </div>
        </div>
        <div className="flex gap-3">{actions}</div>
      </div>
      <picture className="pointer-events-none absolute right-4 bottom-2 hidden sm:block">
        <source media="(prefers-reduced-motion: reduce)" srcSet="/sprites/crob-still.png" />
        <img src="/sprites/crob.webp" alt="" width={84} height={96} className="block" />
      </picture>
    </div>
  );
}

function Pill({ tone, children }: { tone: "good" | "warn" | "neutral"; children: React.ReactNode }) {
  const tones = {
    good: "bg-gain/15 text-gain",
    warn: "bg-brass/15 text-brass",
    neutral: "bg-granite text-steel",
  } as const;
  return <span className={`px-2 py-0.5 font-pixel text-pixel text-shadow-pixel ${tones[tone]}`}>{children}</span>;
}

function DinkPill({ dink }: { dink: DinkStatus }) {
  if (dink.kind === "seen") return <Pill tone="good">Dink connected · last seen {formatRelative(dink.at)}</Pill>;
  return (
    <Link href="/account/link" className="hover:brightness-125">
      <Pill tone="warn">{dink.kind === "waiting" ? "Dink link made · waiting for Dink" : "Dink not set up"} →</Pill>
    </Link>
  );
}
