import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { useStore } from '../../lib/store.jsx';
import TopBar from '../../components/TopBar.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const TYPES = [
  { key: 'facture', name: 'Factures' },
  { key: 'declaration', name: 'Déclarations fiscales' },
  { key: 'contrat', name: 'Contrats' },
];

export default function DocumentCategories() {
  const { t } = useT();
  const navigate = useNavigate();
  const { state } = useStore();

  const folders = useMemo(() => {
    const known = TYPES.map((ty) => ({
      name: ty.name,
      key: ty.key,
      count: state.documents.filter((d) => d.type === ty.key).length,
    }));
    const unclassified = state.documents.filter((d) => !TYPES.some((ty) => ty.key === d.type)).length;
    return unclassified > 0 ? [...known, { name: 'Non classés', key: null, count: unclassified, amber: true }] : known;
  }, [state.documents]);

  const hasAny = state.documents.length > 0;

  return (
    <div className="screen stagger">
      <TopBar title={t('docs.categoriesTitle')} />
      {!hasAny ? (
        <EmptyState icon="📁" text={t('money.noTx')} />
      ) : (
        <div className="grid-2">
          {folders.map((f) => (
            <button
              key={f.name} className={`card inner ${f.amber ? 'tint-amber' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'start' }}
              onClick={() => navigate(f.key ? `/documents?type=${f.key}` : '/documents')}
            >
              <span style={{ fontSize: 22 }}>📁</span>
              <span className="small" style={{ fontWeight: 600 }}>{f.name}</span>
              <span className="tiny muted">{f.count} document{f.count > 1 ? 's' : ''}</span>
            </button>
          ))}
          <button className="card inner" style={{ border: '2px dashed var(--hairline)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-2)' }} onClick={() => navigate('/scanner')}>
            <Plus size={20} /><span className="tiny">Nouveau document</span>
          </button>
        </div>
      )}
    </div>
  );
}
