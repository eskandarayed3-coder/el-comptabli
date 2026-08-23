import { useNavigate } from 'react-router-dom';
import { Languages, Building2, Bell, Download, Shield, FileText, UserCog, LogOut, ChevronRight, Settings, CreditCard, LayoutGrid, Activity, BookOpen } from 'lucide-react';
import { useStore, isPremium as checkPremium, premiumDaysLeft } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import { getDisplayIdentity } from '../../../shared/displayIdentity.js';

const REGIME_KEY = { forfaitaire: 'regimeForfait', reel: 'regimeReel', unknown: 'regimeUnknown' };
const TYPE_KEY = { freelance: 'whoFreelance', micro: 'whoMicro', company: 'whoCompany', accountant: 'whoAccountant' };

export default function MyProfile() {
  const navigate = useNavigate();
  const { state, toast, reset } = useStore();
  const { signOut, user } = useAuth();
  const { t, lang } = useT();
  const identity = getDisplayIdentity(user, state.profile, lang);
  const isPremium = checkPremium(state.settings);
  const daysLeft = premiumDaysLeft(state.settings);

  const ROWS = [
    { icon: Languages, label: t('profile.language'), to: '/profile/language', trailing: state.settings.lang === 'ar' ? 'عربي' : 'FR' },
    { icon: Building2, label: t('profile.company'), to: '/profile/company' },
    { icon: Settings, label: t('profile.settings'), to: '/profile/settings' },
    { icon: Bell, label: t('profile.notifications'), to: '/notifications' },
    { icon: Activity, label: t('home.activityTitle'), to: '/activity' },
    { icon: BookOpen, label: t('nav.learn'), to: '/knowledge' },
    { icon: Download, label: t('docs.exportTitle'), to: '/documents/export' },
    { icon: CreditCard, label: t('sub.billing'), to: '/billing' },
    { icon: Shield, label: t('profile.security'), to: '/profile/security' },
    { icon: FileText, label: t('profile.disclaimerMentions'), to: '/profile/about' },
    { icon: UserCog, label: t('profile.contactExpert'), to: '/experts', badge: t('common.soon') },
    ...(import.meta.env.DEV ? [{ icon: LayoutGrid, label: t('profile.allScreens'), to: '/screens' }] : []),
  ];

  return (
    <div className="screen stagger">
      <header className="profile-hero">
        <div className="avatar" aria-hidden="true">
          {identity.initials}
        </div>
        <div className="col grow" style={{ gap: 4, textAlign: 'start' }}>
          <h1 style={{ font: 'var(--h2)' }}>{identity.displayName}</h1>
          {identity.showEmail && <span className="tiny muted">{identity.displayEmail}</span>}
          <span className="pill teal" style={{ alignSelf: 'flex-start' }}>
            {t(`onboarding.${REGIME_KEY[state.profile.regime] || 'regimeReel'}`)} · {t(`onboarding.${TYPE_KEY[state.profile.userType] || 'whoFreelance'}`)}
          </span>
        </div>
      </header>

      <div className="card tint-indigo">
        <div className="row between">
          <div className="col">
            <span style={{ fontWeight: 700 }}>{t('profile.plan')} : {isPremium ? 'Premium' : t('common.free')}</span>
            {isPremium && state.settings.premiumUntil && <span className="tiny muted">{t('profile.daysLeft', { n: daysLeft })}</span>}
            {!isPremium && <span className="tiny muted">{t('profile.questionsLeft', { n: Math.max(0, 10 - (state.settings.aiQuestionsUsed || 0)) })}</span>}
          </div>
          <button className="pill premium" onClick={() => navigate('/pricing')}>{isPremium ? t('lock.cta') : t('sub.upgrade')}</button>
        </div>
      </div>

      <nav className="profile-menu" aria-label={t('profile.title')}>
        {ROWS.map((r) => (
          <button key={r.to} type="button" className="list-row row between" style={{ width: '100%' }} onClick={() => navigate(r.to)}>
            <span className="row" style={{ gap: 12 }}>
              <span className="icon-wrap teal"><r.icon size={16} aria-hidden="true" /></span>
              <span className="small" style={{ fontWeight: 500 }}>{r.label}</span>
            </span>
            <span className="row" style={{ gap: 8 }}>
              {r.trailing && <span className="tiny muted">{r.trailing}</span>}
              {r.badge && <span className="pill teal">{r.badge}</span>}
              <ChevronRight size={16} color="var(--text-2)" aria-hidden="true" />
            </span>
          </button>
        ))}
      </nav>

      <button
        className="btn btn-danger-soft btn-block"
        type="button"
        onClick={async () => {
          if (!confirm(t('profile.logoutConfirm'))) return;
          try {
            await signOut();
            reset();
            navigate('/welcome');
          } catch (error) {
            toast(error.message || t('profile.logoutError'), 'error');
          }
        }}
      >
        <LogOut size={16} /> {t('profile.logout')}
      </button>
      <p className="tiny center muted">{t('profile.version')} 1.0.0</p>
    </div>
  );
}
