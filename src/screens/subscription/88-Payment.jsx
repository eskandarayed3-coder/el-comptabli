import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import OptionCard from '../../components/OptionCard.jsx';

export default function Payment() {
  const navigate = useNavigate();
  const { patch, toast } = useStore();
  const { t } = useT();
  const [method, setMethod] = useState('card');

  const pay = () => {
    patch('settings', { plan: 'premium' });
    toast(t('sub.activated'));
    navigate('/profile');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('sub.payment')} />

      <div className="card tint-gray">
        <div className="row between"><span className="small">Premium mensuel</span><span className="num" style={{ fontWeight: 700 }}>20 DT</span></div>
        <div className="row between small muted" style={{ marginTop: 6 }}><span>Facturé aujourd’hui</span><span className="num">20 DT</span></div>
      </div>

      <div className="col" style={{ gap: 10 }}>
        <OptionCard title={t('sub.card')} selected={method === 'card'} onClick={() => setMethod('card')} />
        <OptionCard title={t('sub.d17')} selected={method === 'd17'} onClick={() => setMethod('d17')} />
        <OptionCard title="Virement bancaire" selected={method === 'transfer'} onClick={() => setMethod('transfer')} />
      </div>

      {method === 'card' && (
        <div className="col" style={{ gap: 12 }}>
          <div className="field"><label>Numéro de carte</label><input className="input" placeholder="4242 4242 4242 4242" /></div>
          <div className="row" style={{ gap: 12 }}>
            <div className="field grow"><label>MM/AA</label><input className="input" placeholder="12/28" /></div>
            <div className="field grow"><label>CVV</label><input className="input" placeholder="123" /></div>
          </div>
        </div>
      )}

      <p className="tiny center muted">{t('sub.payDemo')}</p>
      <button className="btn btn-primary btn-block" onClick={pay}>{t('sub.payCta', { amount: '20 DT' })}</button>
      <p className="tiny center muted row" style={{ justifyContent: 'center', gap: 4 }}><Lock size={12} /> Paiement sécurisé SSL</p>
    </div>
  );
}
