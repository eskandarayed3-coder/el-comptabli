import { useState } from 'react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';

export default function AiAlerts() {
  const { t } = useT();
  const [alerts, setAlerts] = useState({ anomalies: true, cash: true, vat: true, savings: false });
  const toggle = (k) => setAlerts((s) => ({ ...s, [k]: !s[k] }));

  const ITEMS = [
    { key: 'anomalies', title: 'Anomalies de dépenses', desc: 'Préviens-moi si une catégorie explose' },
    { key: 'cash', title: 'Trésorerie basse', desc: 'Si mon solde projeté < 500 DT' },
    { key: 'vat', title: 'TVA récupérable oubliée', desc: 'Rappel automatique' },
    { key: 'savings', title: 'Opportunités d’économie', desc: 'Suggestions d’optimisation' },
  ];

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('notif.aiAlerts')} ✨</h1>
        <span className="pill premium">{t('common.premium')}</span>
      </div>
      <div className="col" style={{ gap: 10 }}>
        {ITEMS.map((it) => (
          <div key={it.key} className="card row between">
            <span className="col" style={{ gap: 2 }}>
              <span className="small" style={{ fontWeight: 600 }}>{it.title}</span>
              <span className="tiny muted">{it.desc}</span>
            </span>
            <Toggle on={alerts[it.key]} onClick={() => toggle(it.key)} />
          </div>
        ))}
      </div>
      <p className="tiny center muted">L’IA n’envoie jamais tes données à des tiers</p>
    </div>
  );
}
