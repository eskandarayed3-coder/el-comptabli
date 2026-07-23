import { useState } from 'react';
import { Download } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import FilterPills from '../../components/FilterPills.jsx';

export default function TaxHistory() {
  const { state, toast } = useStore();
  const { t, lang } = useT();
  const [year, setYear] = useState('2026');

  const items = state.deadlines.filter((d) => d.date.startsWith(year));
  const totalPaid = items.filter((d) => d.status === 'paid').reduce((s, d) => s + (d.amount || 0), 0);

  const exportCsv = () => {
    const header = ['Date', 'Échéance', 'Statut', 'Montant (DT)'];
    const rows = items.map((d) => [d.date, (d.title[lang] || d.title.fr).replace(/;/g, ','), d.status, d.amount || '']);
    const csv = [header, ...rows].map((r) => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `el-comptabli-echeances-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t('reports.exported'));
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('tax.historyTitle')} />
      <FilterPills options={[{ id: '2026', label: '2026' }, { id: '2025', label: '2025' }]} value={year} onChange={setYear} />

      <div className="col" style={{ gap: 10 }}>
        {items.map((d) => (
          <TintCard key={d.id} tone={d.status === 'paid' ? 'teal' : d.status === 'late' ? 'coral' : 'amber'}>
            <div className="row between">
              <span className="small" style={{ fontWeight: 600 }}>{d.title[lang] || d.title.fr}</span>
              <span className="num" style={{ fontWeight: 700 }}>{d.amount ? fmtDT(d.amount) : 'N/D'}</span>
            </div>
            <div className="row between" style={{ marginTop: 4 }}>
              <span className="tiny muted">{fmtDate(d.date, lang)}</span>
              <StatusPill tone={d.status === 'paid' ? 'success' : d.status === 'late' ? 'danger' : 'warning'}>
                {d.status === 'paid' ? t('common.paid') : d.status === 'late' ? t('common.late') : t('common.upcoming')}
              </StatusPill>
            </div>
          </TintCard>
        ))}
      </div>

      <div className="card tint-gray">
        <span className="row between small" style={{ fontWeight: 700 }}>
          {t('tax.totalPaid', { year, amount: '' })}
          <span className="num">{fmtDT(totalPaid)}</span>
        </span>
      </div>
      <button className="btn btn-ghost btn-block" disabled={items.length === 0} onClick={exportCsv}>
        <Download size={16} /> {t('common.export')}
      </button>
    </div>
  );
}
