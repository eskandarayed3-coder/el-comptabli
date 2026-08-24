import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function DocumentValidation() {
  const navigate = useNavigate();
  const { state, update, toast } = useStore();
  const { t, lang } = useT();
  const queue = state.documents.filter((d) => !d.scanned || d.type === 'facture').slice(0, 3);
  const [index, setIndex] = useState(0);
  const doc = queue[index];

  const validate = () => {
    if (doc) update('documents', doc.id, { scanned: true });
    if (index < queue.length - 1) setIndex((i) => i + 1);
    else { toast(t('common.saved')); navigate('/documents'); }
  };

  if (!doc) return <div className="screen"><TopBar title={t('scanner.detailTitle')} /><EmptyState icon="✅" text={t('notif.empty')} /></div>;

  return (
    <div className="screen stagger">
      <TopBar title={`${t('common.confirm')} (${queue.length})`} subtitle={`${index + 1} sur ${queue.length}`} />
      <div className="card">
        <div className="col" style={{ gap: 10 }}>
          <div style={{ height: 120, borderRadius: 12, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
          <span style={{ fontWeight: 700 }}>{doc.name}</span>
          <span className="tiny muted">{fmtDate(doc.date, lang)}</span>
          <span className="pill success" style={{ alignSelf: 'flex-start' }}>96%</span>
        </div>
      </div>
      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow">{t('common.edit')}</button>
        <button className="btn btn-primary grow" onClick={validate}>{t('common.confirm')} ✓</button>
      </div>
    </div>
  );
}
