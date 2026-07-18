import { usePremiumCountdown } from '../lib/store.jsx';

const pad = (n) => String(n).padStart(2, '0');

// compact: small ticking pill (for headers/badges).
// Otherwise: big digit readout (days/hours/min/sec) for the pricing screen.
export default function PremiumTimer({ premiumUntil, compact, labels }) {
  const c = usePremiumCountdown(premiumUntil);
  if (!c || c.expired) return null;

  if (compact) {
    return (
      <span className="pill teal num" style={{ fontWeight: 700 }}>
        ⏱ {c.days > 0 ? `${c.days}j ` : ''}{pad(c.hours)}:{pad(c.minutes)}:{pad(c.seconds)}
      </span>
    );
  }

  const units = [[c.days, labels.days], [c.hours, labels.hours], [c.minutes, labels.minutes], [c.seconds, labels.seconds]];
  return (
    <div className="row" style={{ gap: 14, justifyContent: 'center' }}>
      {units.map(([v, label], i) => (
        <div key={i} className="col" style={{ alignItems: 'center', gap: 2, minWidth: 46 }}>
          <span className="num" style={{ fontSize: 26, fontWeight: 800, color: 'var(--teal-700)' }}>{pad(v)}</span>
          <span className="tiny muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
