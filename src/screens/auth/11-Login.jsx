import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { recoverAccess } from '../../lib/api.js';
import Logo from '../../components/Logo.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { patch, toast } = useStore();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // There's no password system — accounts are identified by the email
  // collected at signup. Logging in means looking that email up server-
  // side and restoring the real plan/profile, not just flipping a local flag.
  const submit = async () => {
    if (!emailValid || loading) return;
    setLoading(true);
    setError('');
    try {
      const row = await recoverAccess(email.trim());
      patch('profile', {
        name: row.name || '', email: email.trim(), regime: row.regime || 'reel',
        userType: row.user_type || 'freelance', city: row.city || '', activity: row.activity || '',
      });
      patch('settings', {
        onboarded: true,
        plan: row.plan === 'premium' && row.premium_until && new Date(row.premium_until) > new Date() ? 'premium' : 'free',
        premiumUntil: row.premium_until || null,
      });
      toast(t('common.saved'));
      navigate('/home');
    } catch (e) {
      setError(e.friendly?.message || t('recover.notFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen no-nav stagger" style={{ justifyContent: 'center', gap: 24 }}>
      <div className="col" style={{ gap: 8, textAlign: 'center', alignItems: 'center' }}>
        <Logo size={64} />
        <h1>{t('auth.loginTitle')}</h1>
        <p className="small muted">{t('recover.explain')}</p>
      </div>

      <div className="field">
        <label>{t('auth.email')}</label>
        <input
          className="input" type="email" value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="ton@email.com"
          onKeyDown={(e) => { if (e.key === 'Enter' && emailValid) submit(); }}
        />
        {error && <span className="tiny" style={{ color: 'var(--coral-700, #B91C1C)' }}>{error}</span>}
      </div>

      <button className="btn btn-primary btn-block" disabled={!emailValid || loading} onClick={submit}>
        {loading ? <Loader2 size={16} className="spin" /> : t('auth.login')}
      </button>

      <p className="small center muted">
        {t('auth.noAccount')} <button style={{ color: 'var(--teal-700)', fontWeight: 600 }} onClick={() => navigate('/language')}>{t('auth.register')}</button>
      </p>
    </div>
  );
}
