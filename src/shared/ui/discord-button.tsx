import { site } from "@/shared/config/site";
import { DiscordIcon } from "@/shared/ui/discord-icon";

/** Pixel button that opens the clan Discord invite in a new tab. */
export function DiscordButton({ label = "Join the Discord", className = "" }: { label?: string; className?: string }) {
  return (
    <a
      href={site.discordInviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`pixel-btn inline-flex items-center gap-2 bg-rune text-white ${className}`}
    >
      <DiscordIcon className="size-5 drop-shadow-[2px_2px_0_#000]" />
      {label}
    </a>
  );
}
