/**
 * Bob the Cat, speaking in an OSRS-style NPC dialogue box: chathead on the left, name, line,
 * then choices or "Click here to continue". Bob is still for reduced motion.
 * Chathead animation: OSRS Wiki (Bob_The_Cat_Hypnotised.gif), game art © Jagex.
 */
export function BobDialogue({
  children,
  actions,
  speaker = "Bob",
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
  speaker?: string;
}) {
  return (
    <div className="pixel-box flex gap-4 p-4 sm:gap-6 sm:p-6">
      <picture className="shrink-0 self-start">
        <source media="(prefers-reduced-motion: reduce)" srcSet="/guide/bob-still.png" />
        {/* A tiny animated GIF: next/image would re-encode it, so it's served as is. */}
        <img
          src="/guide/bob.gif"
          alt="Bob the Cat"
          width={97}
          height={85}
          className="pixelated block"
        />
      </picture>
      <div className="min-w-0 flex-1 space-y-3" aria-live="polite">
        <p className="font-pixel text-pixel text-brass text-shadow-pixel">{speaker}</p>
        <div className="space-y-2 text-limestone text-shadow-pixel">{children}</div>
        {actions && <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">{actions}</div>}
      </div>
    </div>
  );
}

/** The game's blue dialogue option / "Click here to continue" link, as a button. */
export function DialogueOption({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-pixel text-pixel text-lightning text-shadow-pixel hover:text-limestone disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
