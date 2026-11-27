"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Header account menu. A client component so pages stay static:
 * the session is fetched in the browser instead of during render.
 */
export function UserMenu() {
  const { data: session, status } = useSession();
  const menu = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  // Close on navigation (links inside the menu, or anywhere else).
  useEffect(() => {
    menu.current?.removeAttribute("open");
  }, [pathname]);

  // Close on a click outside the menu, or on Escape.
  useEffect(() => {
    const close = () => menu.current?.removeAttribute("open");
    const onPointerDown = (e: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu.current?.open) {
        close();
        menu.current?.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (status === "loading") {
    return <span className="ml-1 inline-block size-9 bg-keep" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link href="/signin" className="pixel-btn ml-1 bg-granite px-3 py-1.5 text-brass">
        Sign in
      </Link>
    );
  }

  const { name, image } = session.user;
  return (
    <details ref={menu} className="relative ml-1">
      <summary
        className="flex cursor-pointer list-none items-center gap-2 px-1 py-1 [&::-webkit-details-marker]:hidden"
        aria-label="Account menu"
      >
        {image ? (
          <Image src={image} alt="" width={36} height={36} className="size-9 border-2 border-black" />
        ) : (
          <span className="grid size-9 place-items-center border-2 border-black bg-rune font-pixel text-white">
            {name?.charAt(0) ?? "?"}
          </span>
        )}
        <span className="hidden max-w-32 truncate font-pixel text-pixel text-limestone text-shadow-pixel md:inline">
          {name}
        </span>
      </summary>
      <div className="pixel-box absolute right-0 z-30 mt-2 flex w-48 flex-col p-2 font-pixel text-pixel text-shadow-pixel">
        <Link
          href="/account"
          onClick={() => menu.current?.removeAttribute("open")}
          className="px-3 py-2 text-brass hover:bg-rune/30 hover:text-limestone"
        >
          My account
        </Link>
        {session.user.isAdmin && (
          <Link
            href="/admin/claims"
            onClick={() => menu.current?.removeAttribute("open")}
            className="px-3 py-2 text-brass hover:bg-rune/30 hover:text-limestone"
          >
            Link requests
          </Link>
        )}
        {session.user.isAdmin && (
          <Link
            href="/admin/items"
            onClick={() => menu.current?.removeAttribute("open")}
            className="px-3 py-2 text-brass hover:bg-rune/30 hover:text-limestone"
          >
            Item catalog
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut({ redirectTo: "/" })}
          className="px-3 py-2 text-left text-steel hover:bg-rune/30 hover:text-limestone"
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
