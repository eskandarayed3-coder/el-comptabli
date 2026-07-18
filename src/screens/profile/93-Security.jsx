import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';
import StatusPill from '../../components/StatusPill.jsx';

const TXT = {
  password: { fr: 'Changer le mot de passe', ar: 'بدّل كلمة السر' },
  twofa: { fr: 'Double authentification', ar: 'التحقق بخطوتين' },
  bio: { fr: 'Biométrie Face ID', ar: 'البصمة / Face ID' },
  sessions: { fr: 'Sessions actives', ar: 'الجلسات المفتوحة' },
  current: { fr: 'Actuelle', ar: 'الحالية' },
  logout: { fr: 'Déconnecter', ar: 'اخرج' },
  deleteAcc: { fr: 'Supprimer mon compte', ar: 'فسخ حسابي' },
  irreversible: { fr: 'Cette action est irréversible.', ar: 'هذه العملية ما تتعوضش.' },
  ago3d: { fr: 'il y a 3j', ar: 'من 3 أيام' },
};

export default function Security() {
  const navigate = useNavigate();
  const { toast } = useStore();
  const { t, lang } = useT();
  const L = (k) => TXT[k][lang] || TXT[k].fr;
  const [twofa, setTwofa] = useState(true);
  const [bio, setBio] = useState(true);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('auth.twofaTitle')} 🔒`} />
      <button className="card row between" style={{ width: '100%' }}><span className="small">{L('password')}</span><ChevronRight size={16} color="var(--text-2)" /></button>
      <div className="card row between">
        <button className="small row grow" style={{ gap: 6, textAlign: 'start' }} onClick={() => navigate('/security/2fa')}>
          {L('twofa')} <ChevronRight size={14} color="var(--text-2)" />
        </button>
        <Toggle on={twofa} onClick={() => setTwofa((v) => !v)} />
      </div>
      <div className="card row between"><span className="small">{L('bio')}</span><Toggle on={bio} onClick={() => setBio((v) => !v)} /></div>

      <h3>{L('sessions')}</h3>
      <div className="card row between"><span className="small">iPhone 13 · Nabeul</span><StatusPill tone="success">{L('current')}</StatusPill></div>
      <div className="card row between">
        <span className="small">Chrome Windows · {L('ago3d')}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => toast(t('common.saved'))}>{L('logout')}</button>
      </div>

      <button className="card row between" style={{ width: '100%', color: 'var(--pill-danger-fg)' }}><span className="small">{L('deleteAcc')}</span></button>
      <p className="tiny muted">{L('irreversible')}</p>
    </div>
  );
}
