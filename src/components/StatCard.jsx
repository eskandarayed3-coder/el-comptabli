const TINTS = { teal: 'var(--tint-teal)', amber: 'var(--tint-amber)', coral: 'var(--tint-coral)', indigo: 'var(--tint-indigo)' };

export default function StatCard({ label, value, tone = 'teal', delta, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className="stat-card"
      style={{ background: TINTS[tone] }}
      onClick={onClick}
      {...(onClick ? { type: 'button', 'aria-label': `${label} : ${value}` } : {})}
    >
      <span className="value num">{value}</span>
      <span className="label">{label}</span>
      {delta != null && (
        <span className={`delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? '+' : ''}{delta}%</span>
      )}
    </Tag>
  );
}
