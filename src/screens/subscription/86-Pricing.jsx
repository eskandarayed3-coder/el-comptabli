import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

const FREE_FEATURES = ['Questions IA limitées', 'Calendrier fiscal', 'Guides de base'];
const PREMIUM_FEATURES = ['IA illimitée', 'Scanner de factures', 'Exports Excel/PDF', 'Dashboard avancé', 'Rappels intelligents'];

export default function Pricing() {
  const navigate = useNavigate();
  const { state } = useStore();
  const { t } = useT();
  const [cycle, setCycle] = useState('monthly');

  const isPremium = state.settings.plan === 'premium';

  return (
    <div className="screen stagger">
      <TopBar title={t('sub.pricing')} />
      <SegmentedControl
        options={[{ id: 'monthly', label: 'Mensuel' }, { id: 'yearly', label: 'Annuel (-20%)' }]}
        value={cycle} onChange={setCycle}
      />

      <div className="card" style={{ border: '1.5px solid var(--hairline)' }}>
        <div className="col" style={{ gap: 10 }}>
          <div className="row between"><h3>{t('common.free')}</h3><span className="num" style={{ fontWeight: 700 }}>0 DT</span></div>
          {FREE_FEATURES.map((f) => <span key={f} className="small row" style={{ gap: 8 }}><Check size={14} color="var(--text-2)" /> {f}</span>)}
          <button className="btn btn-ghost btn-block" disabled={!isPremium}>{!isPremium ? 'Plan actuel' : 'Rétrograder'}</button>
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(160deg, #fff, var(--tint-indigo))', border: '2px solid #7C3AED', position: 'relative' }}>
        <span className="pill premium" style={{ position: 'absolute', top: -12, insetInlineStart: 20 }}>{t('common.popular')}</span>
        <div className="col" style={{ gap: 10 }}>
          <div className="row between">
            <h3>Premium</h3>
            <span className="num" style={{ fontWeight: 700 }}>{cycle === 'monthly' ? '20 DT/mois' : '192 DT/an'}</span>
          </div>
          {PREMIUM_FEATURES.map((f) => <span key={f} className="small row" style={{ gap: 8 }}><Check size={14} color="var(--teal-700)" /> {f}</span>)}
          <button className="btn btn-primary btn-block" onClick={() => navigate('/payment')}>{isPremium ? 'Plan actuel' : 'Passer Premium'}</button>
        </div>
      </div>

      <div className="card" style={{ opacity: 0.6 }}>
        <div className="row between">
          <h3>Comptable Pro</h3>
          <span className="pill teal">Bientôt</span>
        </div>
        <p className="small muted">Sur devis</p>
      </div>

      <p className="tiny center muted">Annulable à tout moment</p>
    </div>
  );
}
