export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="font-pixel text-pixel text-steel text-shadow-pixel">{eyebrow}</p>}
      <h2 className="font-quill text-pixel-2x text-lightning text-shadow-pixel">{title}</h2>
    </div>
  );
}
