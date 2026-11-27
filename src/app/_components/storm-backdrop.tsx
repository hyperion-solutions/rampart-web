/**
 * The landing hero's backdrop: a pixel-art storm over a castle, echoing the crest.
 * Pure SVG and CSS (no images, no JavaScript): a few KB. Animations live in globals.css
 * (`.storm-cloud`, `.storm-bolt`, `.storm-flash`) and stop for reduced motion.
 */

// The scene is drawn on a 320 × 128 pixel grid and scaled up with crisp edges.
const W = 320;
const H = 128;
/** The castle stands on this line; below it the wall fades into the page. */
const GROUND = 100;

interface Tower {
  x: number;
  w: number;
  h: number;
}

/** Towers flank the crest (which covers roughly the middle 40%), like the castle behind the helms. */
const TOWERS: readonly Tower[] = [
  { x: 8, w: 12, h: 26 },
  { x: 40, w: 10, h: 20 },
  { x: 70, w: 16, h: 34 },
  { x: 102, w: 10, h: 24 },
  { x: 150, w: 20, h: 44 },
  { x: 208, w: 10, h: 24 },
  { x: 234, w: 16, h: 34 },
  { x: 270, w: 10, h: 20 },
  { x: 300, w: 12, h: 26 },
];
const WALL_TOP = GROUND - 12;

/** Crenellations: 2-pixel merlons with 2-pixel gaps along a top edge. */
function merlons(x: number, w: number, y: number) {
  return Array.from({ length: Math.floor(w / 4) + 1 }, (_, i) => (
    <rect key={`${x}-${y}-${i}`} x={x + i * 4} y={y - 3} width={2} height={3} />
  ));
}

/** One small lit window per tall tower: a single brass pixel column. */
function windows(t: Tower) {
  if (t.h < 24) return [];
  const cx = t.x + Math.floor(t.w / 2);
  return [<rect key={t.x} x={cx} y={GROUND - t.h + 7} width={1} height={2} />];
}

/** A chunky pixel cloud built from stacked rows. */
function Cloud({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const rows = [
    [6, 10],
    [3, 18],
    [0, 26],
    [2, 22],
  ] as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {rows.map(([dx, w], i) => (
        <rect key={i} x={dx} y={i * 2} width={w} height={2} />
      ))}
    </g>
  );
}

/** A jagged pixel lightning bolt from (x, 0) down to the castle. */
function Bolt({ x, delay }: { x: number; delay: string }) {
  const path = [
    [x, 8],
    [x - 3, 18],
    [x + 2, 20],
    [x - 2, 32],
    [x + 3, 34],
    [x - 1, 46],
    [x + 2, 48],
    [x, 60],
  ]
    .map(([px, py]) => `${px},${py}`)
    .join(" ");
  return (
    <g className="storm-bolt" style={{ animationDelay: delay }}>
      <polyline points={path} fill="none" stroke="var(--color-rune)" strokeWidth={3} />
      <polyline points={path} fill="none" stroke="var(--color-lightning)" strokeWidth={1} />
    </g>
  );
}

export function StormBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-10 left-1/2 -z-10 h-[560px] w-screen -translate-x-1/2 overflow-hidden sm:h-[720px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
    >
      {/* Night sky, darkest at the top, fading into the page. */}
      <div className="storm-sky absolute inset-0" />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        className="absolute inset-0 h-full w-full"
      >
        {/* Whole-sky flash when lightning strikes. */}
        <rect className="storm-flash" x={0} y={0} width={W} height={H} fill="var(--color-rune)" />

        {/* Two cloud layers drifting at different speeds. */}
        <g className="storm-cloud storm-cloud-slow" fill="var(--color-granite)" opacity={0.9}>
          <Cloud x={6} y={8} scale={1.6} />
          <Cloud x={118} y={4} scale={2} />
          <Cloud x={238} y={10} scale={1.5} />
        </g>
        <g className="storm-cloud storm-cloud-fast" fill="var(--color-mortar)" opacity={0.55}>
          <Cloud x={56} y={20} />
          <Cloud x={186} y={17} scale={1.2} />
          <Cloud x={282} y={24} />
        </g>

        <Bolt x={54} delay="0s" />
        <Bolt x={262} delay="3.5s" />

        {/* The castle: wall, towers, crenellations, lit windows. */}
        <g fill="var(--color-obsidian)">
          <rect x={0} y={WALL_TOP} width={W} height={H - WALL_TOP} />
          {merlons(0, W, WALL_TOP)}
          {TOWERS.map((t) => (
            <g key={t.x}>
              <rect x={t.x} y={GROUND - t.h} width={t.w} height={H - GROUND + t.h} />
              {merlons(t.x, t.w, GROUND - t.h)}
            </g>
          ))}
        </g>
        <g fill="var(--color-brass)" opacity={0.85}>
          {TOWERS.flatMap(windows)}
        </g>
      </svg>
    </div>
  );
}
