import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/composition/auth";
import { SectionHeading } from "@/shared/ui/section-heading";

export const metadata = { title: "My account | Rampart" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?callbackUrl=/account");

  const { name, image } = session.user;

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
          <p className="text-steel text-shadow-pixel">Rampart Discord member</p>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="pixel-btn bg-granite text-brass">
            Sign out
          </button>
        </form>
      </div>

      <div className="pixel-box mt-6 p-6">
        <h2 className="font-pixel text-pixel text-brass text-shadow-pixel">Linked accounts</h2>
        <p className="mt-2 text-steel text-shadow-pixel">
          Linking your RSN through the Dink RuneLite plugin is coming next.
        </p>
      </div>
    </section>
  );
}
