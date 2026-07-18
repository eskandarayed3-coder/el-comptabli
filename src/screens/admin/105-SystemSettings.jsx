export default function SystemSettings() {
  return (
    <>
      <h1>Système</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Clés API</h3>
          <div className="col" style={{ gap: 10 }}>
            {['Gemini', 'OCR'].map((k) => (
              <div key={k} className="row between small">
                <span>{k} : •••• •••• •••• {k === 'Gemini' ? '9x2k' : '4f2a'}</span>
                <button className="btn btn-ghost btn-sm">Régénérer</button>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Configuration RAG</h3>
          <div className="col" style={{ gap: 12 }}>
            <div className="field"><label>Chunk size</label><input className="input" defaultValue="512" /></div>
            <div className="field"><label>Top-K</label><input className="input" defaultValue="5" /></div>
            <div className="field"><label>Seuil de confiance</label><input className="input" defaultValue="0.7" /></div>
          </div>
        </div>
        <div className="card" style={{ padding: 20, gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: 12 }}>Taux fiscaux globaux · 2026</h3>
          <div className="row" style={{ gap: 24 }}>
            <span className="small">TVA 19% / 13% / 7%</span>
            <span className="pill warning">à valider</span>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Maintenance</h3>
          <label className="row small" style={{ gap: 8 }}><input type="checkbox" /> Mode maintenance</label>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 12 }}>Sauvegardes</h3>
          <span className="small muted">Planifiées quotidiennement à 03:00</span>
        </div>
      </div>
      <button className="btn btn-ghost">Voir le journal d’audit</button>
    </>
  );
}
