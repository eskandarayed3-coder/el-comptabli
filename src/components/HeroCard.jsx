export default function HeroCard({ tone = 'teal', title, children, className = '' }) {
  const cls = tone === 'amber' ? 'amber' : tone === 'indigo' ? 'indigo' : '';
  return (
    <div className={`hero-card ${cls} ${className}`}>
      {title && <div className="small" style={{ opacity: 0.9, marginBottom: 8 }}>{title}</div>}
      {children}
    </div>
  );
}

export function ProgressRing({ pct = 0, size = 56 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#fff" strokeWidth="6"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.22,1,0.36,1)' }}
      />
      <text x="50%" y="50%" fill="#fff" fontSize="14" fontWeight="700" textAnchor="middle" dy=".35em" transform={`rotate(90 ${size / 2} ${size / 2})`}>
        {pct}%
      </text>
    </svg>
  );
}
