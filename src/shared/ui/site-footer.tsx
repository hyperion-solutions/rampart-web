import { site } from "@/shared/config/site";
import { DiscordIcon } from "@/shared/ui/discord-icon";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-4 border-black bg-granite shadow-[0_-4px_0_0_var(--color-mortar)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-steel sm:flex-row sm:items-center sm:justify-between">
        <p className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Rampart</p>
        <p className="text-shadow-pixel">
          Stats from{" "}
          <a href="https://wiseoldman.net" className="text-brass hover:text-limestone">
            Wise Old Man
          </a>
          . Not affiliated with Jagex.{" "}
          <a href={site.discordInviteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-brass hover:text-limestone">
            <DiscordIcon className="size-4" />
            Join our Discord
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
