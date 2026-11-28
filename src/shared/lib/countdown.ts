/** Countdown wording for bingo boards, in the spirit of Majora's Mask's three-day title cards. */

export type CountdownTone = "draft" | "upcoming" | "running" | "urgent" | "over";

export interface Countdown {
  readonly text: string;
  readonly tone: CountdownTone;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
const ordinal = (n: number) => ORDINALS[n - 1] ?? `${n}th`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "2 days", "5 hours", "12 minutes": the largest sensible unit. */
function span(ms: number): string {
  if (ms >= 2 * DAY) return plural(Math.floor(ms / DAY), "day");
  if (ms >= HOUR) return plural(Math.ceil(ms / HOUR), "hour");
  return plural(Math.max(1, Math.ceil(ms / MINUTE)), "minute");
}

export function describeCountdown(
  now: Date,
  startsAt: Date,
  endsAt: Date,
  status: "draft" | "live" | "finished",
): Countdown {
  const toStart = startsAt.getTime() - now.getTime();
  const toEnd = endsAt.getTime() - now.getTime();

  // Finished boards may have been finished before their end date: no "ended … ago" for them.
  if (status === "finished") return { text: "Finished · results are final", tone: "over" };
  if (status === "draft") {
    return { text: toStart > 0 ? `Draft · starts in ${span(toStart)}` : "Draft · not published", tone: "draft" };
  }
  if (toEnd <= 0) return { text: `Ended ${span(Math.max(MINUTE, -toEnd))} ago · results being checked`, tone: "over" };
  if (toStart > 0) return { text: `Starts in ${span(toStart)}`, tone: "upcoming" };

  if (toEnd <= HOUR) return { text: `Final hour · ${plural(Math.ceil(toEnd / MINUTE), "minute")} remain`, tone: "urgent" };
  if (toEnd <= DAY) return { text: `Dawn of the final day · ${plural(Math.ceil(toEnd / HOUR), "hour")} remain`, tone: "urgent" };

  const day = Math.floor(-toStart / DAY) + 1;
  return { text: `Dawn of the ${ordinal(day)} day · ${plural(Math.ceil(toEnd / HOUR), "hour")} remain`, tone: "running" };
}
