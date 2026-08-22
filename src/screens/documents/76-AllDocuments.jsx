import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search as SearchIcon, FolderOpen, Eye, FileCheck2, FileOutput } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import { buildDossier } from '../../lib/accountant.js';
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
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('type') || 'all');
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
  const dossier = buildDossier(state.transactions, state.documents);

  return (
    <div className="screen stagger">
      <TopBar
        title={`${t('docs.title')} 📁`}
        right={
          <div className="row" style={{ gap: 6 }}>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => navigate('/documents/categories')} title={t('money.categories')}><FolderOpen size={16} /></button>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => navigate('/documents/view')} title={t('common.see')}><Eye size={16} /></button>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => navigate('/documents/export')} title={t('docs.accountantPack')}><FileOutput size={16} /></button>
          </div>
        }
      />

      <section className="card tint-indigo" aria-labelledby="accountant-pack-title">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="avatar" aria-hidden="true"><FileCheck2 size={21} /></div>
          <div className="grow">
            <h2 id="accountant-pack-title" style={{ margin: 0, fontSize: 18 }}>{t('docs.accountantPack')}</h2>
            <p className="small muted" style={{ margin: '4px 0 0' }}>{t('docs.accountantPackHint')}</p>
          </div>
        </div>
        <div className="row between small" style={{ marginTop: 16 }}>
          <span>{t('docs.scansChecked', { count: dossier.scannedCount })}</span>
          <strong className="num">{dossier.scannedCount}</strong>
        </div>
        <div className="row between small" style={{ marginTop: 8 }}>
          <span>{t('docs.toReview', { count: dossier.scansToReview })}</span>
          <strong className="num">{dossier.scansToReview}</strong>
        </div>
        <div className="row between small" style={{ marginTop: 8 }}>
          <span>{t('docs.missingProofs', { count: dossier.missingProofs })}</span>
          <strong className="num">{dossier.missingProofs}</strong>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate('/documents/export')}>
          <FileOutput size={17} /> {t('docs.prepareExport')}
        </button>
      </section>
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
