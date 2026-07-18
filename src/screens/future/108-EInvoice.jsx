import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function EInvoice() {
  const { toast } = useStore();
  const { t } = useT();
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('1000');

  const tva = (Number(amount) || 0) * 0.19;

  return (
    <div className="screen stagger">
      <TopBar title={`${t('future.einvoice')} 🧾`} />
      <div className="field"><label>Client</label><input className="input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Wafa Trading" /></div>
      <div className="field"><label>Montant HT</label><input className="input num" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
      <div className="card tint-gray"><span className="small num">TVA auto : {tva.toFixed(3)} DT</span></div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Checklist conformité</h3>
        <div className="col" style={{ gap: 8 }}>
          {['Format conforme ✓', 'Signature ✓', 'Archivage ✓'].map((c) => <span key={c} className="small">{c}</span>)}
        </div>
      </div>

      <div style={{ height: 80, borderRadius: 12, background: 'var(--bg-2)' }} />
      <button className="btn btn-primary btn-block" onClick={() => toast(t('common.saved'))}>Générer & envoyer</button>
      <p className="tiny center muted">Conforme à l’obligation e-facture services 2026</p>
    </div>
  );
}
