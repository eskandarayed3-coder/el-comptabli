import { useState } from 'react';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';

const TXT = {
  master: { fr: 'Rappels activés', ar: 'التذكيرات مفعّلة' },
  d7: { fr: '7 jours avant', ar: '7 أيام قبل' },
  d3: { fr: '3 jours avant', ar: '3 أيام قبل' },
  day: { fr: 'Le jour même', ar: 'نفس النهار' },
  late: { fr: 'En cas de retard, quotidien', ar: 'في حالة تأخير، كل يوم' },
  channels: { fr: 'Canaux', ar: 'القنوات' },
  dnd: { fr: 'Ne pas déranger', ar: 'ما تزعجنيش' },
};

export default function TaxReminders() {
  const { t, lang } = useT();
  const L = (k) => TXT[k][lang] || TXT[k].fr;
  const [master, setMaster] = useState(true);
  const [timings, setTimings] = useState({ d7: true, d3: true, day: true, late: true });
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });

  const toggleT = (k) => setTimings((s) => ({ ...s, [k]: !s[k] }));
  const toggleC = (k) => setChannels((s) => ({ ...s, [k]: !s[k] }));

  const row = (label, on, onClick, tone) => (
    <div className={`card row between ${tone ? 'tint-coral' : ''}`} key={label}>
      <span className="small" style={{ fontWeight: 600 }}>{label}</span>
      <Toggle on={on} onClick={onClick} />
    </div>
  );

  return (
    <div className="screen stagger">
      <TopBar title={`${t('notif.reminders')} 🔔`} />
      {row(L('master'), master, () => setMaster((v) => !v))}
      <div className="col" style={{ gap: 10, opacity: master ? 1 : 0.5, pointerEvents: master ? 'auto' : 'none' }}>
        {row(L('d7'), timings.d7, () => toggleT('d7'))}
        {row(L('d3'), timings.d3, () => toggleT('d3'))}
        {row(L('day'), timings.day, () => toggleT('day'))}
        {row(L('late'), timings.late, () => toggleT('late'), true)}
      </div>
      <h3>{L('channels')}</h3>
      {row('Push', channels.push, () => toggleC('push'))}
      {row('Email', channels.email, () => toggleC('email'))}
      <div className="card row between">
        <span className="small row" style={{ gap: 8, fontWeight: 600 }}>SMS <span className="pill premium">{t('common.premium')}</span></span>
        <Toggle on={channels.sms} onClick={() => toggleC('sms')} />
      </div>
      <div className="card row between">
        <span className="small">{L('dnd')}</span>
        <span className="tiny muted num">22:00 · 08:00</span>
      </div>
    </div>
  );
}
