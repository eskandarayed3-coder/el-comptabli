import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { todayISO } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import Toggle from '../../components/Toggle.jsx';

const CATS = ['Ventes', 'Services', 'Formation', 'Autre'];

export default function AddIncome() {
  const navigate = useNavigate();
  const { add, logActivity, toast } = useStore();
  const { t, lang } = useT();
  const [amount, setAmount] = useState('850');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Ventes');
  const [date, setDate] = useState(todayISO());
  const [status, setStatus] = useState('paid');
  const [note, setNote] = useState('');
  const [withTva, setWithTva] = useState(true);

  const amountNum = Number(amount) || 0;
  const tva = withTva ? amountNum - amountNum / 1.19 : 0;

  const save = () => {
    add('transactions', {
      kind: 'income', vendor: client, label: client || 'Recette', category: category.toLowerCase(),
      date, amountTTC: amountNum, amountHT: amountNum - tva, tva, status: status === 'pending' ? 'pending' : 'paid',
    });
    logActivity(`Recette +${amountNum} DT ajoutée`, 'TrendingUp');
    toast(t('common.saved'));
    navigate('/income');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('money.addIncome')} />
      <div className="center" style={{ padding: '20px 0' }}>
        <input
          className="num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
          style={{ border: 'none', background: 'transparent', fontSize: 48, fontWeight: 700, textAlign: 'center', width: '60%', color: 'var(--teal-700)' }}
        />
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal-700)' }}> DT</span>
      </div>

      <div className="field">
        <label>{t('money.client')}</label>
        <input className="input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Wafa Trading" />
      </div>

      <div className="field">
        <label>{t('common.category')}</label>
        <div className="scroll-x">
          {CATS.map((c) => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{t('common.date')}</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="field">
        <label>Statut</label>
        <SegmentedControl
          options={[{ id: 'paid', label: t('common.paid') }, { id: 'pending', label: t('common.upcoming') }]}
          value={status} onChange={setStatus}
        />
      </div>

      <div className="card row between">
        <span className="small" style={{ fontWeight: 600 }}>{lang === 'ar' ? 'مفوترة مع TVA 19%' : 'Facturé avec TVA 19%'}{withTva ? ` (TVA : ${tva.toFixed(1)} DT)` : ''}</span>
        <Toggle on={withTva} onClick={() => setWithTva((v) => !v)} />
      </div>

      <div className="field">
        <label>Note (optionnel)</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <button className="btn btn-primary btn-block" onClick={save} disabled={!amountNum}>{t('common.save')}</button>
    </div>
  );
}
