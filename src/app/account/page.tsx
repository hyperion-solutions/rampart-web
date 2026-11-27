import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/composition/auth";
import { container } from "@/composition/container";
import { SectionHeading } from "@/shared/ui/section-heading";

export const metadata = { title: "My account | Rampart" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/account");

  const { name, image, rank, rankIconUrl } = session.user;
  const accounts = session.user.id ? await container.listMyAccounts.execute(session.user.id) : [];

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <section className="mx-auto max-w-2xl">
      <SectionHeading eyebrow="Signed in with Discord" title="My account" />
      <div className="pixel-box flex flex-wrap items-center gap-5 p-6">
        {image && <Image src={image} alt="" width={64} height={64} className="size-16 border-4 border-black" />}
        <div className="flex-1">
          <p className="font-pixel text-pixel text-limestone text-shadow-pixel">{name}</p>
          <p className="flex items-center gap-2 text-steel text-shadow-pixel">
            {rankIconUrl && (
              // The rank's Discord role icon (public/icons/ranks), served as the original PNG.
              <Image src={rankIconUrl} alt="" width={24} height={24} unoptimized />
            )}
            {rank ? `${rank} in the Rampart Discord` : "Rampart Discord member"}
          </p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="pixel-btn bg-granite text-brass">
            Sign out
          </button>
        </form>
      </div>

      <div className="pixel-box mt-6 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Linked accounts</h2>
        {accounts.length === 0 ? (
          <p className="mt-2 text-steel text-shadow-pixel">
            No accounts linked yet. Link your clan accounts by logging in with the Dink RuneLite plugin.
          </p>
        ) : (
          <ul className="mt-3 divide-y-4 divide-obsidian">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <span className="font-pixel text-pixel text-limestone text-shadow-pixel">{a.rsn}</span>
                <span className="text-steel text-shadow-pixel">
                  {a.verifiedVia === "dink" ? "Verified with Dink" : "Approved by an admin"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/account/link" className="pixel-btn mt-4 bg-rune text-white">
          {accounts.length === 0 ? "Link an account" : "Link another account"}
        </Link>
      </div>
    </section>
  );
}
