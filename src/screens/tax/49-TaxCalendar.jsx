import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate, fmtMonth, todayISO } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import DayStrip from '../../components/DayStrip.jsx';
import StatCard from '../../components/StatCard.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import TintCard from '../../components/TintCard.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import FAB from '../../components/FAB.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const TONE = { late: 'coral', upcoming: 'amber', paid: 'teal' };
const PILL = { late: 'danger', upcoming: 'warning', paid: 'success' };

export default function TaxCalendar() {
  const navigate = useNavigate();
  const { state, toast } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);
  const month = todayISO().slice(0, 7);
  const pickDay = (iso) => setSelectedDay((cur) => (cur === iso ? null : iso));

  const markedDays = useMemo(() => {
    const m = {};
    state.deadlines.forEach((d) => {
      m[d.date] = [...(m[d.date] || []), TONE[d.status] === 'coral' ? 'danger' : TONE[d.status] === 'amber' ? 'warning' : 'success'];
    });
    return m;
  }, [state.deadlines]);

  const filtered = state.deadlines
    .filter((d) => filter === 'all' || d.status === filter)
    .filter((d) => !selectedDay || d.date === selectedDay);
  const thisWeek = state.deadlines.filter((d) => d.status !== 'paid' && d.date.startsWith(month)).length;
  const thisMonthCount = state.deadlines.filter((d) => d.date.startsWith(month)).length;
  const lateCount = state.deadlines.filter((d) => d.status === 'late').length;

  const filters = [
    { id: 'all', label: t('common.all') },
    { id: 'late', label: t('common.late') },
    { id: 'upcoming', label: t('common.upcoming') },
    { id: 'paid', label: t('common.paid') },
  ];

  return (
    <div className="screen stagger">
      <TopBar
        title={`${t('tax.calendarTitle')} · ${fmtMonth(`${month}-01`, lang)}`}
        onBack={null}
        right={<button className="icon-btn" onClick={() => navigate('/notifications')}><Bell size={18} /></button>}
      />

      <DayStrip month={month} markedDays={markedDays} lang={lang} onPick={pickDay} selected={selectedDay} />

      {selectedDay && (
        <button className="pill teal num" style={{ alignSelf: 'flex-start' }} onClick={() => setSelectedDay(null)}>
          {fmtDate(selectedDay, lang)} · ✕
        </button>
      )}

      <div className="grid-3">
        <StatCard label={t('tax.thisWeek')} value={thisWeek} tone="amber" />
        <StatCard label={t('tax.thisMonth')} value={thisMonthCount} tone="teal" />
        <StatCard label={t('common.late')} value={lateCount} tone="coral" />
      </div>

      <FilterPills options={filters} value={filter} onChange={setFilter} />

      <div className="col" style={{ gap: 10 }}>
        {filtered.length === 0 && <EmptyState icon="🎉" text={t('notif.empty')} />}
        {filtered.map((d) => (
          <TintCard key={d.id} tone={TONE[d.status]} onClick={() => navigate(`/tax/deadline/${d.id}`)}>
            <div className="col" style={{ gap: 8 }}>
              <div className="row between">
                <span style={{ fontWeight: 700 }}>{d.title[lang] || d.title.fr}</span>
                <StatusPill tone={PILL[d.status]}>
                  {d.status === 'late' ? t('common.late') : d.status === 'paid' ? t('common.paid') : t('common.upcoming')}
                </StatusPill>
              </div>
              <span className="small muted">{d.note[lang] || d.note.fr}</span>
              <div className="row between">
                <span className="tiny muted num">{fmtMonth(d.date, lang)}</span>
                {d.status !== 'paid' && (
                  <button
                    className="small"
                    style={{ color: 'var(--teal-700)', fontWeight: 600 }}
                    onClick={(e) => { e.stopPropagation(); toast(t('tax.reminderSet')); }}
                  >
                    {t('tax.remindMe')}
                  </button>
                )}
              </div>
            </div>
          </TintCard>
        ))}
      </div>

      <FAB icon={Plus} label={t('tax.newReminder')} onClick={() => toast(t('tax.reminderSet'))} />
    </div>
  );
}
