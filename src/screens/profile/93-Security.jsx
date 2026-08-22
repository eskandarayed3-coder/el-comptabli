import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { useAuth } from '../../lib/auth.jsx';

const TXT = {
  password: { fr: 'Changer le mot de passe', ar: 'بدّل كلمة السر' },
  twofa: { fr: 'Double authentification', ar: 'التحقق بخطوتين' },
  bio: { fr: 'Biométrie Face ID', ar: 'البصمة / Face ID' },
  sessions: { fr: 'Sessions actives', ar: 'الجلسات المفتوحة' },
  current: { fr: 'Actuelle', ar: 'الحالية' },
  logout: { fr: 'Déconnecter', ar: 'اخرج' },
  deleteAcc: { fr: 'Supprimer mon compte', ar: 'فسخ حسابي' },
  irreversible: { fr: 'Cette action est irréversible.', ar: 'هذه العملية ما تتعوضش.' },
  thisDevice: { fr: 'Cet appareil', ar: 'الجهاز هذا' },
  sessionsNote: { fr: 'Tes données restent sur cet appareil — pas de suivi de session multi-appareils pour l’instant.', ar: 'معطياتك تبقى في الجهاز هذا برك — ما فماش متابعة جلسات بين أجهزة عدة توا.' },
};

export default function Security() {
  const navigate = useNavigate();
  const { toast } = useStore();
  const { signOut, deleteAccount } = useAuth();
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
      <div className="card row between"><span className="small">{L('thisDevice')}</span><StatusPill tone="success">{L('current')}</StatusPill></div>
      <p className="tiny muted">{L('sessionsNote')}</p>

      <button className="card row between" style={{ width: '100%', color: 'var(--pill-danger-fg)' }} onClick={async () => {
        if (!confirm(L('irreversible'))) return;
        try {
          await deleteAccount();
          toast(t('common.deleted'));
          navigate('/splash');
        } catch (error) {
          toast(error.message || 'Suppression impossible.', 'error');
        }
      }}><span className="small">{L('deleteAcc')}</span></button>
      <button className="card row between" style={{ width: '100%' }} onClick={async () => { await signOut(); navigate('/login'); }}>
        <span className="small">{L('logout')}</span><ChevronRight size={16} color="var(--text-2)" />
      </button>
      <p className="tiny muted">{L('irreversible')}</p>
    </div>
  );
}
