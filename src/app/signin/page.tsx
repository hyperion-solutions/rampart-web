import { redirect } from "next/navigation";
import { auth, signIn } from "@/composition/auth";
import { DiscordButton } from "@/shared/ui/discord-button";
import { site } from "@/shared/config/site";
import { DiscordIcon } from "@/shared/ui/discord-icon";

export const metadata = { title: "Sign in | Rampart" };

const RANK_REQUEST_URL = `https://discord.com/channels/${site.discordGuildId}/${site.rankRequestChannelId}`;

const ERRORS: Readonly<Record<string, string>> = {
  "not-in-server": "Only Rampart clan members can sign in. Join the Discord, then try again.",
  "no-rank": "You need a clan rank to sign in. Ask for one in the rank-request channel, then sign in again once you have it.",
  AccessDenied: "Sign-in was cancelled. Try again when you're ready.",
};
const GENERIC_ERROR = "Sign-in didn't work. Try again, and tell an admin on Discord if it keeps happening.";

/** Only allow redirects back into this site. */
const safeCallback = (value: string | undefined) =>
  value?.startsWith("/") && !value.startsWith("//") ? value : "/account";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const redirectTo = safeCallback(callbackUrl);

  if ((await auth())?.user) redirect(redirectTo);

  async function signInWithDiscord() {
    "use server";
    await signIn("discord", { redirectTo });
  }

  return (
    <section className="mx-auto max-w-lg">
      <div className="pixel-box p-8 text-center">
        <h1 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Sign in</h1>
        <p className="mt-3 text-steel text-shadow-pixel">
          Sign in with the Discord account you use in the Rampart server. You need a clan rank.
        </p>

        {error && (
          <p role="alert" className="mt-6 bg-banner/30 px-4 py-3 text-limestone text-shadow-pixel">
            {ERRORS[error] ?? GENERIC_ERROR}
          </p>
        )}

        <form action={signInWithDiscord} className="mt-8">
          <button type="submit" className="pixel-btn inline-flex items-center gap-2 bg-rune text-white">
            <DiscordIcon className="size-5 drop-shadow-[2px_2px_0_#000]" />
            Sign in with Discord
          </button>
        </form>

        {error === "not-in-server" && (
          <div className="mt-4">
            <DiscordButton />
          </div>
        )}

        {error === "no-rank" && (
          <div className="mt-4">
            <a
              href={RANK_REQUEST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn inline-flex items-center gap-2 bg-granite text-brass"
            >
              <DiscordIcon className="size-5 drop-shadow-[2px_2px_0_#000]" />
              Request a rank
            </a>
          </div>
        )}

        <p className="mt-8 text-steel text-shadow-pixel">
          We only ask Discord for your name, avatar and your roles in the Rampart server. We never see
          your email or password.
        </p>
      </div>
    </section>
  );
}
