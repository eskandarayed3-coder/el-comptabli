import { useNavigate } from 'react-router-dom';
import { Languages, Building2, Bell, Download, Shield, FileText, UserCog, LogOut, ChevronRight, Settings, CreditCard, LayoutGrid, Activity } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';

const REGIME_KEY = { forfaitaire: 'regimeForfait', reel: 'regimeReel', unknown: 'regimeUnknown' };
const TYPE_KEY = { freelance: 'whoFreelance', micro: 'whoMicro', company: 'whoCompany', accountant: 'whoAccountant' };

export default function MyProfile() {
  const navigate = useNavigate();
  const { state, patch, toast } = useStore();
  const { t } = useT();
  const isPremium = state.settings.plan === 'premium';

  const ROWS = [
    { icon: Languages, label: t('profile.language'), to: '/profile/language', trailing: state.settings.lang === 'ar' ? 'عربي' : 'FR' },
    { icon: Building2, label: t('profile.company'), to: '/profile/company' },
    { icon: Settings, label: t('profile.settings'), to: '/profile/settings' },
    { icon: Bell, label: t('profile.notifications'), to: '/notifications' },
    { icon: Activity, label: t('home.activityTitle'), to: '/activity' },
    { icon: Download, label: t('docs.exportTitle'), to: '/documents/export' },
    { icon: CreditCard, label: t('sub.billing'), to: '/billing' },
    { icon: Shield, label: t('profile.security'), to: '/profile/security' },
    { icon: FileText, label: t('profile.disclaimerMentions'), to: '/profile/about' },
    { icon: UserCog, label: t('profile.contactExpert'), to: '/experts', badge: t('common.soon') },
    { icon: LayoutGrid, label: t('profile.allScreens'), to: '/screens' },
  ];

  return (
    <div className="screen stagger">
      <div className="col center" style={{ alignItems: 'center', gap: 8, paddingTop: 12 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--tint-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'var(--teal-800)' }}>
          {(state.profile.name || '?').slice(0, 1).toUpperCase()}
        </div>
        <h2>{state.profile.name}</h2>
        <span className="tiny muted">{state.profile.email || 'eskandar@example.com'}</span>
        <span className="pill teal">
          {t(`onboarding.${REGIME_KEY[state.profile.regime] || 'regimeReel'}`)} · {t(`onboarding.${TYPE_KEY[state.profile.userType] || 'whoFreelance'}`)}
        </span>
      </div>

      <div className="card tint-indigo">
        <div className="row between">
          <div className="col">
            <span style={{ fontWeight: 700 }}>{t('profile.plan')} : {isPremium ? 'Premium' : t('common.free')}</span>
            {!isPremium && <span className="tiny muted">{t('profile.questionsLeft', { n: Math.max(0, 10 - (state.settings.aiQuestionsUsed || 0)) })}</span>}
          </div>
          {!isPremium && <button className="pill premium" onClick={() => navigate('/upgrade')}>{t('sub.upgrade')}</button>}
        </div>
      </div>

      <div className="col" style={{ gap: 4 }}>
        {ROWS.map((r) => (
          <button key={r.to} className="row between" style={{ padding: '14px 4px', width: '100%' }} onClick={() => navigate(r.to)}>
            <span className="row" style={{ gap: 12 }}>
              <span className="icon-wrap teal"><r.icon size={16} /></span>
              <span className="small" style={{ fontWeight: 500 }}>{r.label}</span>
            </span>
            <span className="row" style={{ gap: 8 }}>
              {r.trailing && <span className="tiny muted">{r.trailing}</span>}
              {r.badge && <span className="pill teal">{r.badge}</span>}
              <ChevronRight size={16} color="var(--text-2)" />
            </span>
          </button>
        ))}
      </div>

      <button className="btn btn-danger-soft btn-block" onClick={() => { patch('settings', { onboarded: false }); navigate('/welcome'); }}>
        <LogOut size={16} /> {t('profile.logout')}
      </button>
      <p className="tiny center muted">{t('profile.version')} 1.0.0</p>
    </div>
  );
}
