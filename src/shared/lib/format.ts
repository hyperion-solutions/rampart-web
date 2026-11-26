export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));
export const formatXp = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}k` : String(n);
