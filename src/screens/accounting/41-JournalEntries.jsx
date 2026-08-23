import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import StatusPill from '../../components/StatusPill.jsx';

export default function JournalEntries() {
  const { state } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const entries = (state.journalEntries || []).filter((entry) => filter === 'all' || entry.status === filter);

  return (
    <div className="screen stagger">
      <TopBar title={t('accounting.journal')} />
      <FilterPills
        options={[
          { id: 'all', label: t('common.all') },
          { id: 'draft', label: 'Brouillons' },
          { id: 'review', label: 'À valider' },
          { id: 'posted', label: 'Comptabilisées' },
        ]}
        value={filter}
        onChange={setFilter}
      />
      <div className="col" style={{ gap: 10 }}>
        {entries.map((entry) => (
          <div key={entry.id} className="card inner">
            <div className="row between small">
              <span style={{ fontWeight: 700 }}>{entry.number}</span>
              <StatusPill tone={entry.status === 'posted' || entry.status === 'reversed' ? 'success' : 'warning'}>{entry.status}</StatusPill>
            </div>
            <p className="small" style={{ margin: '8px 0 4px' }}>{entry.label}</p>
            <div className="row between tiny muted">
              <span>{entry.reference || entry.source || 'Saisie comptable'}</span>
              <span>{fmtDate(entry.date, lang)}</span>
            </div>
          </div>
        ))}
        {!entries.length && <p className="small muted center">Aucune écriture comptable pour ce filtre.</p>}
      </div>
    </div>
  );
}
