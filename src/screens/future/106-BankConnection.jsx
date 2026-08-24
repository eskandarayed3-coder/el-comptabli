import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';

const BANKS = ['BIAT', 'BNA', 'Attijari', 'STB', 'Amen', 'Zitouna'];

export default function BankConnection() {
  const { toast } = useStore();
  const { t } = useT();
  const [bank, setBank] = useState(null);
  const [email, setEmail] = useState('');

  return (
    <div className="screen stagger">
      <div className="top-bar"><h1 className="grow">{t('future.bank')} 🏦</h1><span className="pill teal">{t('common.soon')}</span></div>
      <div className="grid-3">
        {BANKS.map((b) => (
          <button key={b} className={`card inner ${bank === b ? 'tint-teal' : ''}`} style={{ textAlign: 'center' }} onClick={() => setBank(b)}>{b}</button>
        ))}
      </div>
      <div className="card tint-teal">
        <div className="row" style={{ gap: 10 }}>
          <Lock size={18} color="var(--teal-700)" />
          <span className="small">Connexion en lecture seule, on ne peut jamais toucher ton argent.</span>
        </div>
      </div>
      <button className="btn btn-primary btn-block" disabled>Connecter</button>
      <div className="field">
        <label>Préviens-moi au lancement</label>
        <div className="row" style={{ gap: 8 }}>
          <input className="input grow" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" />
          <button className="btn btn-ghost" onClick={() => toast(t('common.saved'))}>OK</button>
        </div>
      </div>
    </div>
  );
}
