"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BobDialogue, DialogueOption } from "@/app/_components/bob-dialogue";
import type { LinkOutcome } from "@/modules/accounts/domain/link-token";
import { AutoRefresh } from "./auto-refresh";
import { CopyButton } from "./copy-button";
import { CreateLinkForm } from "./create-link-form";
import { ManualLinkForm } from "./manual-link-form";

/** The last thing Dink reported, serialised for the client. */
export interface WizardAttempt {
  readonly rsn: string;
  readonly outcome: LinkOutcome;
  /** ISO time. Only compared with itself, so client and server clocks never need to agree. */
  readonly at: string;
}

type Step = "intro" | "install" | "create" | "paste" | "login" | "result" | "manual";

/** The Dink path, in order. The intro, result and manual steps sit outside the count. */
const DINK_STEPS: readonly Step[] = ["install", "create", "paste", "login"];

interface Saved {
  readonly step: Step;
  /** The attempt already on record when the member started waiting: a different one means they logged in. */
  readonly seenAt: string | null;
}

const STORAGE_KEY = "rampart:link-wizard";

function load(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Partial<Saved>;
    const steps: readonly Step[] = ["intro", ...DINK_STEPS, "result", "manual"];
    return saved.step && steps.includes(saved.step) ? { step: saved.step, seenAt: saved.seenAt ?? null } : null;
  } catch {
    return null;
  }
}

/**
 * Account linking, one step at a time, with Bob the Cat explaining each one in an OSRS-style
 * dialogue. The step is remembered in this browser, so members can switch to the game and come back.
 */
export function LinkWizard({
  hasLink,
  attempt,
  claims,
}: {
  hasLink: boolean;
  attempt: WizardAttempt | null;
  /** The member's manual link requests, rendered on the server. */
  claims: React.ReactNode;
}) {
  const [saved, setSaved] = useState<Saved>({ step: "intro", seenAt: null });
  const [newUrl, setNewUrl] = useState<string | null>(null);
  const { seenAt } = saved;
  // A remembered step can be out of date (the link was turned off, or the result is gone): fall back.
  const step: Step =
    saved.step === "result" && !attempt
      ? "intro"
      : (saved.step === "paste" || saved.step === "login") && !hasLink
        ? "create"
        : saved.step;

  useEffect(() => {
    const restored = load();
    if (restored) setSaved(restored);
  }, []);

  const go = useCallback((next: Step, nextSeenAt: string | null = null) => {
    const value = { step: next, seenAt: nextSeenAt };
    setSaved(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // Private mode or storage full: the wizard still works, it just won't remember the step.
    }
  }, []);

  const startWaiting = () => go("login", attempt?.at ?? null);

  // Dink reported a login while we were waiting: show what happened.
  useEffect(() => {
    if (step === "login" && attempt && attempt.at !== seenAt) go("result", attempt.at);
  }, [step, attempt, seenAt, go]);

  const onCreated = useCallback((url: string) => setNewUrl(url), []);

  const dinkIndex = DINK_STEPS.indexOf(step);
  const back = (to: Step) => <DialogueOption onClick={() => go(to)}>Back</DialogueOption>;

  return (
    <div className="space-y-3">
      {dinkIndex >= 0 && (
        <p className="font-pixel text-pixel text-steel text-shadow-pixel">
          Step {dinkIndex + 1} of {DINK_STEPS.length}
        </p>
      )}

      {step === "intro" && (
        <BobDialogue
          actions={
            <>
              <DialogueOption onClick={() => go("install")}>Yes, I play on RuneLite</DialogueOption>
              <DialogueOption onClick={() => go("manual")}>No, or I can&apos;t use Dink</DialogueOption>
            </>
          }
        >
          <p>Meow! I&apos;m Bob. I&apos;ll help you link your game accounts to the clan site.</p>
          <p>
            The easy way is the Dink plugin for RuneLite: you log in to the game once and Dink tells us the account is
            yours. No passwords or codes.
          </p>
          <p>Do you play on RuneLite?</p>
        </BobDialogue>
      )}

      {step === "install" && (
        <BobDialogue
          actions={
            <>
              <DialogueOption onClick={() => go("create")}>I&apos;ve installed Dink</DialogueOption>
              {back("intro")}
            </>
          }
        >
          <p>First, install Dink.</p>
          <p>
            In RuneLite, open the Plugin Hub (the wrench icon, then the Plugin Hub button at the bottom). Search for
            &quot;Dink&quot; and click Install.
          </p>
        </BobDialogue>
      )}

      {step === "create" && (
        <BobDialogue
          actions={
            <>
              {newUrl && <DialogueOption onClick={() => go("paste")}>I&apos;ve copied it</DialogueOption>}
              {hasLink && !newUrl && (
                <DialogueOption onClick={startWaiting}>My link is already in Dink</DialogueOption>
              )}
              {back("install")}
            </>
          }
        >
          <p>Now make your personal link. Dink sends your logins to it.</p>
          <p>Copy it straight away: I can only show it once, and anyone who has it can link accounts to you.</p>
          <div className="pt-2">
            <CreateLinkForm hasLink={hasLink} onCreated={onCreated} />
          </div>
        </BobDialogue>
      )}

      {step === "paste" && (
        <BobDialogue
          actions={
            <>
              <DialogueOption onClick={startWaiting}>Done, it&apos;s in Dink</DialogueOption>
              {back("create")}
            </>
          }
        >
          <p>Paste your link into Dink:</p>
          <ol className="list-inside list-decimal space-y-1">
            <li>In RuneLite&apos;s plugin list, find Dink and click its cog to open the settings.</li>
            <li>Open the Advanced section.</li>
            <li>Paste the link into Custom Metadata Handler.</li>
            <li>In the same section, tick Send Clan Name.</li>
          </ol>
          {newUrl && (
            <div className="space-y-2 pt-2">
              <code className="block break-all bg-obsidian px-3 py-2 font-body text-limestone">{newUrl}</code>
              <CopyButton text={newUrl} />
            </div>
          )}
        </BobDialogue>
      )}

      {step === "login" && (
        <BobDialogue
          actions={
            <>
              <DialogueOption onClick={() => go("paste")}>Back</DialogueOption>
              <DialogueOption onClick={() => go("manual")}>It&apos;s not working: ask an admin</DialogueOption>
            </>
          }
        >
          <p>Now log out of the game and log back in. I&apos;ll watch for Dink and carry on by myself.</p>
          <p role="status" className="blink font-pixel text-pixel text-brass">
            Waiting for your login...
          </p>
          <p className="text-steel">
            Nothing after a minute? Check the link is in Custom Metadata Handler (not Primary Webhook URLs) and that
            Dink is switched on.
          </p>
          <AutoRefresh />
        </BobDialogue>
      )}

      {step === "result" && attempt && <Result attempt={attempt} go={go} startWaiting={startWaiting} />}

      {step === "manual" && (
        <BobDialogue actions={<DialogueOption onClick={() => go("intro")}>Back to Dink</DialogueOption>}>
          <p>No problem. Tell me your RSN and an admin will link it for you.</p>
          <p>
            They&apos;ll check it&apos;s yours, usually by asking you on Discord. If you use Dink later, it&apos;s verified
            automatically.
          </p>
          <div className="space-y-4 pt-2">
            <ManualLinkForm />
            {claims}
          </div>
        </BobDialogue>
      )}
    </div>
  );
}

function Result({
  attempt,
  go,
  startWaiting,
}: {
  attempt: WizardAttempt;
  go: (step: Step) => void;
  startWaiting: () => void;
}) {
  const { rsn, outcome } = attempt;
  const account = (
    <Link href="/account" className="font-pixel text-pixel text-lightning text-shadow-pixel hover:text-limestone">
      Go to my account
    </Link>
  );

  switch (outcome) {
    case "linked":
    case "updated":
      return (
        <BobDialogue
          actions={
            <>
              {account}
              <DialogueOption onClick={startWaiting}>Link another account</DialogueOption>
            </>
          }
        >
          <p className="font-pixel text-pixel text-gain">
            {outcome === "linked" ? `${rsn} is linked to you!` : `${rsn} was already yours. All up to date!`}
          </p>
          <p>
            Got alts in the clan? Log in on them with the same Dink settings and each one links to you too. You don&apos;t
            need a new link.
          </p>
        </BobDialogue>
      );
    case "not-in-clan":
      return (
        <BobDialogue
          actions={
            <>
              <DialogueOption onClick={startWaiting}>Try again</DialogueOption>
              <DialogueOption onClick={() => go("manual")}>Ask an admin instead</DialogueOption>
            </>
          }
        >
          <p className="font-pixel text-pixel text-brass">Hiss... {rsn} isn&apos;t in the Rampart clan.</p>
          <p>
            Only clan accounts can be linked. If you just joined, ask a Rampart admin to add you to the clan on Wise Old
            Man, then log in again.
          </p>
        </BobDialogue>
      );
    case "owned-by-someone-else":
      return (
        <BobDialogue
          actions={
            <>
              <DialogueOption onClick={startWaiting}>Try another account</DialogueOption>
              {account}
            </>
          }
        >
          <p className="font-pixel text-pixel text-brass">{rsn} is already linked to another member.</p>
          <p>If it&apos;s yours, ask an admin on Discord and they&apos;ll sort it out.</p>
        </BobDialogue>
      );
  }
}
