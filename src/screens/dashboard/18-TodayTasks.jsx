import { Plus } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate, todayISO } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import TintCard from '../../components/TintCard.jsx';
import FAB from '../../components/FAB.jsx';

export default function TodayTasks() {
  const { state, update, toast } = useStore();
  const { t, lang } = useT();
  const doneCount = state.tasks.filter((x) => x.done).length;
  const pct = state.tasks.length ? Math.round((doneCount / state.tasks.length) * 100) : 0;

  const toggle = (task) => {
    update('tasks', task.id, { done: !task.done, status: !task.done ? 'done' : 'upcoming' });
    if (!task.done) toast(t('common.saved'));
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('home.tasksTitle', { date: fmtDate(todayISO(), lang) })} />
      <div className="col" style={{ gap: 6 }}>
        <span className="small muted">{t('home.tasksProgress', { done: doneCount, total: state.tasks.length })}</span>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {state.tasks.map((task) => (
          <TintCard key={task.id} tone={task.done ? 'teal' : task.status === 'late' ? 'coral' : 'amber'} onClick={() => toggle(task)}>
            <div className="row" style={{ gap: 12 }}>
              <span
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${task.done ? 'var(--teal-700)' : 'var(--text-2)'}`,
                  background: task.done ? 'var(--teal-700)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12,
                }}
              >
                {task.done ? '✓' : ''}
              </span>
              <span
                className="small"
                style={{ fontWeight: 600, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}
              >
                {task.text[lang] || task.text.fr}
              </span>
            </div>
          </TintCard>
        ))}
      </div>
      <FAB icon={Plus} label={t('home.newTask')} onClick={() => toast(t('common.saved'))} />
    </div>
  );
}
