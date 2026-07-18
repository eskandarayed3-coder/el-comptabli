import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search as SearchIcon, FolderOpen, Eye } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FAB from '../../components/FAB.jsx';

const TYPE_LABEL = { facture: 'Facture', declaration: 'Déclaration', contrat: 'Contrat' };

export default function AllDocuments() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'facture', label: t('docs.invoice') },
    { id: 'declaration', label: t('docs.declaration') },
    { id: 'contrat', label: t('docs.contract') },
  ];

  const docs = state.documents
    .filter((d) => filter === 'all' || d.type === filter)
    .filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="screen stagger">
      <TopBar
        title={`${t('docs.title')} 📁`}
        right={
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => navigate('/documents/categories')} title={t('money.categories')}><FolderOpen size={16} /></button>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => navigate('/documents/view')} title={t('common.see')}><Eye size={16} /></button>
          </div>
        }
      />
      <div className="input-row">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} />
        <span className="trailing"><SearchIcon size={16} /></span>
      </div>
      <FilterPills options={filters} value={filter} onChange={setFilter} />

      {docs.length === 0 && <EmptyState text={t('money.noTx')} />}
      <div className="grid-2">
        {docs.map((d) => (
          <button key={d.id} className="card inner" style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'start' }} onClick={() => navigate(`/documents/${d.id}`)}>
            <div style={{ height: 64, borderRadius: 10, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📄</div>
            <span className="small" style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            <span className="tiny muted">{fmtDate(d.date, lang)} · {d.size}</span>
            <StatusPill tone={d.scanned ? 'success' : 'warning'}>{d.scanned ? t('scanner.scanned') : TYPE_LABEL[d.type]}</StatusPill>
          </button>
        ))}
      </div>
      <p className="tiny center muted">{docs.length} documents</p>
      <FAB icon={Plus} label={t('docs.upload')} onClick={() => navigate('/documents/upload')} />
    </div>
  );
}
