export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="pixel-box flex flex-col-reverse items-center px-4 py-3 text-center">
      <dt className="font-pixel text-pixel text-steel text-shadow-pixel">{label}</dt>
      <dd className="font-pixel text-pixel-2x text-brass text-shadow-pixel">{value}</dd>
    </div>
  );
}
