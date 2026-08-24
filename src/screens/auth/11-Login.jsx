import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Gift, Loader2, Mail } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { useAuth } from '../../lib/auth.jsx';
import { useStore } from '../../lib/store.jsx';
import { safeInternalNext } from '../../lib/authRedirect.js';
import Logo from '../../components/Logo.jsx';
import { getDisplayIdentity } from '../../../shared/displayIdentity.js';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { requestMagicLink, startFreeTrial } = useAuth();
  const { state } = useStore();
  const { t } = useT();
  const [email, setEmail] = useState(() => getDisplayIdentity({}, { email: params.get('email') || state.profile.email }).displayEmail);
  const [loading, setLoading] = useState(false);
  const [startingTrial, setStartingTrial] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [trialError, setTrialError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const emailId = 'login-email';
  const errorId = 'login-email-error';

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const requestedNext = params.get('next') || '/home';
  const next = safeInternalNext(requestedNext);

  const submit = async () => {
    if (!emailValid || loading) return;
    setLoading(true);
    setEmailError('');
    try {
      const normalizedEmail = email.trim();
      await requestMagicLink(normalizedEmail, next);
      setSentTo(normalizedEmail);
    } catch (e) {
      setEmailError(e.friendly?.code === 'service_unavailable' ? t('auth.emailUnavailable') : (e.friendly?.message || t('auth.emailUnavailable')));
    } finally {
      setLoading(false);
    }
  };

  const startTrial = async () => {
    if (loading || startingTrial) return;
    setStartingTrial(true);
    setTrialError('');
    try {
      await startFreeTrial();
      navigate(next);
    } catch {
      setTrialError(t('auth.trialUnavailable'));
    } finally {
      setStartingTrial(false);
    }
  };

  if (sentTo) {
    const isGmail = sentTo.toLowerCase().endsWith('@gmail.com');
    return (
      <div className="screen no-nav stagger" style={{ justifyContent: 'center', gap: 20 }}>
        <div className="col" style={{ gap: 8, textAlign: 'center', alignItems: 'center' }}>
          <div className="card tint-teal center" style={{ width: 72, height: 72, padding: 0, borderRadius: '50%' }}>
            <CheckCircle2 size={36} color="var(--teal-700)" />
          </div>
          <h1>{t('auth.linkSentTitle')}</h1>
          <p className="small muted">{t('auth.linkSentBody', { email: sentTo })}</p>
        </div>

        <div className="card tint-gray col" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <Mail size={20} color="var(--teal-700)" style={{ flex: '0 0 auto', marginTop: 2 }} />
            <p className="small" style={{ margin: 0 }}>{t('auth.linkSentStep')}</p>
          </div>
          <p className="tiny muted" style={{ margin: 0 }}>{t('auth.linkSentHint')}</p>
        </div>

        {isGmail && (
          <a className="btn btn-primary btn-block" href="https://mail.google.com/" target="_blank" rel="noreferrer">
            {t('auth.openGmail')} <ExternalLink size={16} />
          </a>
        )}

        <button className="btn btn-ghost btn-block" disabled={loading} onClick={submit}>
          {loading ? <Loader2 size={16} className="spin" /> : t('auth.resendSecureLink')}
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => { setSentTo(''); setEmailError(''); }}>
          {t('auth.useAnotherEmail')}
        </button>
      </div>
    );
  }

  return (
    <div className="screen no-nav stagger" style={{ justifyContent: 'center', gap: 24 }}>
      <div className="col" style={{ gap: 8, textAlign: 'center', alignItems: 'center' }}>
        <Logo size={64} />
        <h1>{t('auth.loginTitle')}</h1>
          <p className="small muted">{t('auth.loginIntro')}</p>
      </div>

      <form className="col" style={{ gap: 16 }} onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <div className="field">
          <label htmlFor={emailId}>{t('auth.email')}</label>
          <input
            id={emailId} className="input" type="email" value={email} autoComplete="email"
            onChange={(event) => { setEmail(event.target.value); setEmailError(''); }}
            placeholder="ton@email.com" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? errorId : undefined}
          />
          {emailError && <span id={errorId} className="tiny" role="alert" style={{ color: 'var(--coral-700, #B91C1C)' }}>{emailError}</span>}
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={!emailValid || loading}>
          {loading ? <Loader2 size={16} className="spin" /> : t('auth.continueWithEmail')}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          disabled={loading || startingTrial}
          onClick={startTrial}
        >
          {startingTrial ? <Loader2 size={16} className="spin" /> : <Gift size={17} aria-hidden="true" />}
          {t('onboarding.tryFree')}
        </button>
        <p className="tiny center muted" style={{ margin: -6 }}>
          {t('onboarding.tryFreeNote')}
        </p>
        {trialError && <p className="tiny center" role="alert" style={{ margin: 0, color: 'var(--coral-700, #B91C1C)' }}>{trialError}</p>}
      </form>

      <p className="tiny center muted" style={{ margin: 0 }}>{t('auth.noPasswordNeeded')}</p>

      <p className="small center muted">
        {t('auth.noAccount')} <button type="button" style={{ color: 'var(--teal-700)', fontWeight: 600 }} onClick={() => navigate('/language')}>{t('auth.register')}</button>
      </p>
    </div>
  );
}
