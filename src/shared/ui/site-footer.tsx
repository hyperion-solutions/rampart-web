import Link from "next/link";
import { site } from "@/shared/config/site";
import { DiscordIcon } from "@/shared/ui/discord-icon";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-4 border-black bg-granite shadow-[0_-4px_0_0_var(--color-mortar)]">
      {/* Baseline-aligned, so the small text sits on the same line as the wordmark, not centred above it. */}
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-steel sm:flex-row sm:items-baseline sm:justify-between">
        <p className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Rampart</p>
        <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-shadow-pixel">
          <li>
            Stats from{" "}
            <a href="https://wiseoldman.net" className="text-brass hover:text-limestone">
              Wise Old Man
            </a>
          </li>
          <li aria-hidden>·</li>
          <li>Not affiliated with Jagex</li>
          <li aria-hidden>·</li>
          <li>
            <Link href="/privacy" className="text-brass hover:text-limestone">
              Privacy
            </Link>
          </li>
          <li aria-hidden>·</li>
          <li>
            <a
              href={site.discordInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brass hover:text-limestone"
            >
              {/* Inline, not flex: keeps the link on the same baseline as the other items. */}
              <DiscordIcon className="mr-1.5 inline size-4 align-[-3px]" />
              Join our Discord
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
