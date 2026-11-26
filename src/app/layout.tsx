import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/shared/fonts";
import { SiteFooter } from "@/shared/ui/site-footer";
import { SiteHeader } from "@/shared/ui/site-header";

export const metadata: Metadata = {
  title: "Rampart | 1-45 Defence Irons",
  description: "Rampart is an Old School RuneScape clan for 1-45 Defence ironmen. Stats, members and weekly gains.",
  icons: { icon: "/brand/rampart-crest.webp" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
