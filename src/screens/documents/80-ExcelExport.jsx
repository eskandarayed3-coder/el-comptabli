import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

function toCsv(rows) {
  const header = ['Date', 'Type', 'Libellé', 'Catégorie', 'HT', 'TVA', 'TTC'];
  const lines = rows.map((r) => [r.date, r.kind, r.label, r.category, r.amountHT, r.tva, r.amountTTC].join(';'));
  return [header.join(';'), ...lines].join('\n');
}

export default function ExcelExport() {
  const { state, toast } = useStore();
  const { t, lang } = useT();
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('excel');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState({ tx: true, invoices: true, journal: false, vat: false });
  const [done, setDone] = useState(false);

  const toggle = (k) => setContent((c) => ({ ...c, [k]: !c[k] }));

  const generate = () => {
    const csv = toCsv(state.transactions);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `el-comptabli-export-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);
    toast(t('reports.exported'));
  };

  const CONTENT_ITEMS = [
    { id: 'tx', label: 'Transactions' },
    { id: 'invoices', label: 'Factures scannées' },
    { id: 'journal', label: 'Journal comptable' },
    { id: 'vat', label: 'Rapport TVA' },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={`${t('docs.exportTitle')} 📤`} />
      <FilterPills
        options={[{ id: 'month', label: 'Mois' }, { id: 'quarter', label: 'Trimestre' }, { id: 'year', label: 'Année' }, { id: 'custom', label: 'Personnalisé' }]}
        value={period} onChange={setPeriod}
      />

      <div className="col" style={{ gap: 8 }}>
        {CONTENT_ITEMS.map((c) => (
          <button key={c.id} className="card row between" style={{ width: '100%' }} onClick={() => toggle(c.id)}>
            <span className="small" style={{ fontWeight: 600 }}>{c.label}</span>
            <span style={{ color: content[c.id] ? 'var(--teal-700)' : 'var(--hairline)' }}>{content[c.id] ? '✓' : '○'}</span>
          </button>
        ))}
      </div>

      <SegmentedControl options={[{ id: 'excel', label: 'Excel' }, { id: 'pdf', label: 'PDF' }, { id: 'csv', label: 'CSV' }]} value={format} onChange={setFormat} />

      <div className="field">
        <label>Email de ton comptable (optionnel)</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naji@cabinet.tn" />
      </div>

      <button className="btn btn-primary btn-block" onClick={generate}>Générer l’export</button>

      {done && (
        <div className="card tint-teal">
          <span className="small">✓ Export prêt{email ? ` (envoyé à ${email})` : ''}</span>
        </div>
      )}
    </div>
  );
}
