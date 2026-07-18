import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

const SLOTS = ['10:00', '11:30', '14:00', '16:30'];

const TXT = {
  bookWith: { fr: 'Réserver avec', ar: 'احجز مع' },
  session: { fr: 'Consultation 30 min · 60 DT', ar: 'استشارة 30 دقيقة · 60 دينار' },
  slots: { fr: 'Créneaux', ar: 'الأوقات المتاحة' },
  mode: { fr: 'Mode', ar: 'الطريقة' },
  visio: { fr: 'Visio', ar: 'فيديو' },
  office: { fr: 'Au cabinet', ar: 'في المكتب' },
  day: { fr: 'Jeudi 23 juillet', ar: 'الخميس 23 جويلية' },
  confirm: { fr: 'Confirmer et payer', ar: 'ثبّت واخلص' },
};

export default function AppointmentBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useStore();
  const { t, lang } = useT();
  const L = (k) => TXT[k][lang] || TXT[k].fr;
  const [slot, setSlot] = useState('11:30');
  const [mode, setMode] = useState('visio');

  const confirm = () => { toast(t('experts.booked')); navigate('/experts/history'); };

  return (
    <div className="screen stagger">
      <TopBar title={`${L('bookWith')} ${id === 'sonia' ? 'Sonia K.' : 'Mounir B.'}`} />
      <div className="card tint-teal"><span className="small" style={{ fontWeight: 600 }}>{L('session')}</span></div>

      <div className="field">
        <label>{L('slots')}</label>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {SLOTS.map((s) => (
            <button key={s} className={`chip ${slot === s ? 'active' : ''}`} onClick={() => setSlot(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{L('mode')}</label>
        <SegmentedControl options={[{ id: 'visio', label: L('visio') }, { id: 'cabinet', label: L('office') }]} value={mode} onChange={setMode} />
      </div>

      <div className="card tint-gray">
        <span className="small">{L('day')} · {slot} · {mode === 'visio' ? L('visio') : L('office')} · 60 DT</span>
      </div>

      <button className="btn btn-primary btn-block" onClick={confirm}>{L('confirm')}</button>
    </div>
  );
}
