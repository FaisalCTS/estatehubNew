// Locality score card. In Phase 2+, these scores will come from a real data API.
// For now, we derive plausible scores deterministically from the locality name.

type Props = { locality: string; city: string };

const DIMENSIONS = [
  { key: "connectivity", label: "Connectivity", icon: "🚇" },
  { key: "schools",      label: "Schools",       icon: "🏫" },
  { key: "hospitals",    label: "Hospitals",      icon: "🏥" },
  { key: "safety",       label: "Safety",         icon: "🛡️" },
  { key: "lifestyle",    label: "Lifestyle",      icon: "🛍️" }
];

function deterministicScore(seed: string, dim: string): number {
  let h = 0;
  for (let i = 0; i < seed.length + dim.length; i++) {
    const c = (seed + dim).charCodeAt(i % (seed.length + dim.length));
    h = ((h << 5) - h + c) | 0;
  }
  return 5 + (Math.abs(h) % 50) / 10; // 5.0 – 9.9
}

export function LocalityScore({ locality, city }: Props) {
  const seed = `${locality}-${city}`.toLowerCase();
  const scores = DIMENSIONS.map((d) => ({
    ...d,
    score: deterministicScore(seed, d.key)
  }));
  const overall = parseFloat((scores.reduce((s, d) => s + d.score, 0) / scores.length).toFixed(1));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-primary">Locality Score</h2>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-brand-primary">{overall}</span>
          <span className="text-brand-muted text-sm">/10</span>
        </div>
      </div>
      <p className="text-sm text-brand-muted mb-4">{locality}, {city}</p>
      <div className="space-y-3">
        {scores.map((d) => (
          <div key={d.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-brand-ink flex items-center gap-1.5">
                <span>{d.icon}</span> {d.label}
              </span>
              <span className="text-sm font-semibold text-brand-ink">{d.score.toFixed(1)}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-accent rounded-full transition-all"
                style={{ width: `${(d.score / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-brand-muted mt-3">
        Scores are indicative. Data from infrastructure records & resident feedback.
      </p>
    </div>
  );
}
