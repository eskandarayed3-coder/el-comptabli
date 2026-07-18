import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate, todayISO } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import TintCard from '../../components/TintCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Notifications() {
  const navigate = useNavigate();
  const { state, update, toast } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'deadline', label: t('notif.reminders') },
    { id: 'ai', label: t('notif.aiAlerts') },
    { id: 'scan', label: 'Système' },
  ];

  const items = state.notifications
    .filter((n) => filter === 'all' || n.kind === filter)
    .sort((a, b) => b.at.localeCompare(a.at));

  const markAllRead = () => items.forEach((n) => update('notifications', n.id, { read: true }));

  const today = items.filter((n) => n.at.startsWith(todayISO()));
  const older = items.filter((n) => !n.at.startsWith(todayISO()));

  const renderGroup = (label, list) => list.length > 0 && (
    <div className="col" style={{ gap: 8 }}>
      <h3 className="small muted">{label}</h3>
      {list.map((n) => {
        const Icon = Icons[n.icon] || Icons.Bell;
        return (
          <TintCard key={n.id} tone={n.tone} onClick={() => update('notifications', n.id, { read: true })}>
            <div className="row" style={{ gap: 10 }}>
              <Icon size={18} />
              <span className="small grow" style={{ fontWeight: 600 }}>{n.text[lang] || n.text.fr}</span>
              {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pill-danger-fg)', flexShrink: 0 }} />}
            </div>
          </TintCard>
        );
      })}
    </div>
  );

  return (
    <div className="screen stagger">
      <TopBar
        title={t('notif.title')}
        right={
          <div className="row" style={{ gap: 6 }}>
            <button className="small" style={{ color: 'var(--teal-700)' }} onClick={markAllRead}>{t('notif.markRead')}</button>
            <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={() => navigate('/notifications/reminders')} title={t('notif.reminders')}>
              <Icons.Settings size={16} />
            </button>
          </div>
        }
      />
      <FilterPills options={filters} value={filter} onChange={setFilter} />
      <button className="list-row" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/notifications/ai-alerts')}>
        <span className="icon-wrap indigo"><Icons.Sparkles size={18} /></span>
        <span className="small grow" style={{ fontWeight: 600 }}>{t('notif.aiAlerts')}</span>
        <Icons.ChevronRight size={16} color="var(--text-2)" />
      </button>
      {items.length === 0 && <EmptyState icon="🔕" text={t('notif.empty')} />}
      {renderGroup(t('common.today'), today)}
      {renderGroup(t('common.yesterday'), older)}
    </div>
  );
}
