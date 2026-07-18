import * as Icons from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function RecentActivities() {
  const { state } = useStore();
  const { t, lang } = useT();

  return (
    <div className="screen stagger">
      <TopBar title={t('home.activityTitle')} />
      {state.activities.length === 0 && <EmptyState text={t('money.noTx')} />}
      <div className="col" style={{ gap: 2 }}>
        {state.activities.map((a) => {
          const Icon = Icons[a.icon] || Icons.Activity;
          return (
            <div key={a.id} className="row" style={{ gap: 12, padding: '12px 4px' }}>
              <span className="icon-wrap teal"><Icon size={16} /></span>
              <span className="small grow">{a.text[lang] || a.text.fr}</span>
              <span className="tiny muted">{fmtDate(a.at, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
