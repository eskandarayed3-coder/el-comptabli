import { Plus } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const FOLDERS = [
  { name: 'Factures fournisseurs', count: 18 },
  { name: 'Reçus', count: 9 },
  { name: 'Déclarations fiscales', count: 4 },
  { name: 'Exports comptables', count: 3 },
  { name: 'Non classés', count: 2, amber: true },
];

export default function DocumentCategories() {
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={t('docs.categoriesTitle')} />
      <div className="grid-2">
        {FOLDERS.map((f) => (
          <div key={f.name} className={`card inner ${f.amber ? 'tint-amber' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📁</span>
            <span className="small" style={{ fontWeight: 600 }}>{f.name}</span>
            <span className="tiny muted">{f.count} documents</span>
            {f.amber && <StatusPill tone="warning">À classer</StatusPill>}
          </div>
        ))}
        <button className="card inner" style={{ border: '2px dashed var(--hairline)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-2)' }}>
          <Plus size={20} /><span className="tiny">Nouveau dossier</span>
        </button>
      </div>
    </div>
  );
}
