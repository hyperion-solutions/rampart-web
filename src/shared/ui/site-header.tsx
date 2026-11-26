import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Clan" },
  { href: "/members", label: "Members" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b-4 border-black bg-granite shadow-[0_4px_0_0_var(--color-mortar)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/rampart-crest.webp"
            alt=""
            width={48}
            height={48}
            className="crest"
            priority
          />
          <span className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Rampart</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-2 py-1 font-pixel text-pixel text-brass text-shadow-pixel hover:text-limestone"
            >
              {l.label}
            </Link>
          ))}
          <span
            className="hidden px-2 py-1 font-pixel text-pixel text-steel/60 text-shadow-pixel sm:inline"
            title="Account linking is coming soon"
          >
            Link account (soon)
          </span>
        </nav>
      </div>
    </header>
  );
}
