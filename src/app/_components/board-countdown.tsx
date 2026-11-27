"use client";

import { useEffect, useState } from "react";
import { describeCountdown, type CountdownTone } from "@/shared/lib/countdown";

const TONE: Readonly<Record<CountdownTone, string>> = {
  draft: "text-steel",
  upcoming: "text-lightning",
  running: "text-brass",
  urgent: "text-banner blink",
  over: "text-steel",
};

/**
 * Live countdown to a board's end. The server renders the first value; the browser updates it
 * every 30 seconds, so pages stay static.
 */
export function BoardCountdown({
  startsAt,
  endsAt,
  status,
  variant = "card",
}: {
  /** ISO timestamps. */
  startsAt: string;
  endsAt: string;
  status: "draft" | "live" | "finished";
  variant?: "card" | "title";
}) {
  const compute = () => describeCountdown(new Date(), new Date(startsAt), new Date(endsAt), status);
  const [countdown, setCountdown] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setCountdown(describeCountdown(new Date(), new Date(startsAt), new Date(endsAt), status)), 30_000);
    return () => clearInterval(id);
  }, [startsAt, endsAt, status]);

  if (variant === "title") {
    return (
      <p
        suppressHydrationWarning
        className={`pixel-box px-6 py-4 text-center font-quill text-pixel-2x text-shadow-pixel ${TONE[countdown.tone]}`}
      >
        {countdown.text}
      </p>
    );
  }
  return (
    <span suppressHydrationWarning className={`font-pixel text-pixel text-shadow-pixel ${TONE[countdown.tone]}`}>
      {countdown.text}
    </span>
  );
}
