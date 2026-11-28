import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/composition/auth";
import { container } from "@/composition/container";
import { SectionHeading } from "@/shared/ui/section-heading";
import { AccountCard } from "./_components/account-card";
import { CharacterPanel, type DinkStatus } from "./_components/character-panel";
import { YourBingo } from "./_components/your-bingo";
import { DeleteAccountButton } from "./_components/delete-account-button";

export const metadata = { title: "My account | Rampart" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/account");

  const { name, image, rank, rankIconUrl } = session.user;
  const userId = session.user.id;
  const [accounts, token, bingo] = userId
    ? await Promise.all([
        container.getMyAccountsOverview.execute(userId),
        container.getLinkToken.execute(userId),
        container.bingo.getMyBingo.execute(userId),
      ])
    : [[], null, null];
  const dink: DinkStatus = !token
    ? { kind: "none" }
    : token.lastUsedAt
      ? { kind: "seen", at: token.lastUsedAt }
      : { kind: "waiting" };

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <section className="mx-auto max-w-4xl">
      <SectionHeading eyebrow="Signed in with Discord" title="My account" />
      <CharacterPanel
        name={name ?? "Member"}
        image={image ?? null}
        rank={rank ?? null}
        rankIconUrl={rankIconUrl ?? null}
        linkedCount={accounts.length}
        dink={dink}
        actions={
          <form action={signOutAction}>
            <button type="submit" className="pixel-btn bg-granite text-brass">
              Sign out
            </button>
          </form>
        }
      />

      <div className="mt-10">
        <YourBingo bingo={bingo} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">Linked accounts</h2>
          <Link href="/account/link" className="pixel-btn bg-rune text-white">
            {accounts.length === 0 ? "Link an account" : "Link another account"}
          </Link>
        </div>
        {accounts.length === 0 ? (
          <p className="pixel-box p-6 text-steel text-shadow-pixel">
            No accounts linked yet. Link your clan accounts by logging in with the Dink RuneLite plugin.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((overview) => (
              <AccountCard key={overview.account.id} overview={overview} />
            ))}
          </div>
        )}
      </div>

      <div className="pixel-box mt-10 space-y-3 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Your data</h2>
        <p className="text-steel text-shadow-pixel">
          See what we store and why on the{" "}
          <Link href="/privacy" className="text-brass hover:text-limestone">
            privacy page
          </Link>
          . You can delete all of it at any time.
        </p>
        <DeleteAccountButton />
      </div>
    </section>
  );
}
