export default function KpiRow({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 16 }}>
      {items.map((it, i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <div className="tiny muted">{it.label}</div>
          <div style={{ font: '700 28px/1.3 var(--font-sans)' }} className="num">{it.value}</div>
          {it.delta != null && (
            <div className={`delta ${it.delta >= 0 ? 'up' : 'down'}`}>{it.delta >= 0 ? '+' : ''}{it.delta}%</div>
          )}
        </div>
      ))}
    </div>
  );
}
