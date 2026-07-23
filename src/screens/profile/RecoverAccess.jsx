import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailSearch, Loader2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { recoverAccess } from '../../lib/api.js';
import TopBar from '../../components/TopBar.jsx';

export default function RecoverAccess() {
  const navigate = useNavigate();
  const { patch, toast } = useStore();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
      toast(t('recover.success'));
      navigate('/home');
    } catch (e) {
      setError(e.friendly?.message || t('recover.notFound'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('recover.title')} />

      <div className="card tint-indigo center" style={{ padding: 24 }}>
        <MailSearch size={32} color="#4F46E5" />
        <p className="small" style={{ marginTop: 10, textAlign: 'center' }}>{t('recover.explain')}</p>
      </div>

      <div className="field">
        <label>{t('onboarding.yourEmail')}</label>
        <input
          className="input" type="email" value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder="toi@exemple.com"
        />
        {error && <span className="tiny" style={{ color: 'var(--coral-700, #B91C1C)' }}>{error}</span>}
      </div>

      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" disabled={!emailValid || loading} onClick={submit}>
        {loading ? <Loader2 size={16} className="spin" /> : t('recover.submit')}
      </button>
    </div>
  );
}
