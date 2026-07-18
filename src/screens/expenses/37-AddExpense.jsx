import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { todayISO } from '../../lib/format.js';
import { CATEGORIES } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';

export default function AddExpense() {
  const navigate = useNavigate();
  const { add, logActivity, toast } = useStore();
  const { t, lang } = useT();
  const [amount, setAmount] = useState('420');
  const [category, setCategory] = useState('carburant');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [recoverable, setRecoverable] = useState(true);

  const amountNum = Number(amount) || 0;
  const tva = recoverable ? amountNum - amountNum / 1.19 : 0;

  const save = () => {
    add('transactions', {
      kind: 'expense', vendor, label: note || vendor || categoryLabelFallback(category, lang),
      category, date, amountTTC: amountNum, amountHT: amountNum - tva, tva,
    });
    logActivity(`Dépense -${amountNum} DT ajoutée`, 'TrendingDown');
    toast(t('common.saved'));
    navigate('/expenses');
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('money.addExpense')} />
      <div className="center" style={{ padding: '20px 0' }}>
        <input
          className="num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
          style={{ border: 'none', background: 'transparent', fontSize: 48, fontWeight: 700, textAlign: 'center', width: '60%', color: 'var(--pill-danger-fg)' }}
        />
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--pill-danger-fg)' }}> DT</span>
      </div>

      <div className="field">
        <label>{t('common.category')}</label>
        <div className="scroll-x">
          {CATEGORIES.map((c) => (
            <button key={c.id} className={`chip ${category === c.id ? 'active' : ''}`} onClick={() => setCategory(c.id)}>
              {c[lang === 'ar' ? 'ar' : 'fr']}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{t('money.vendor')}</label>
        <input className="input" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Station Agil" />
      </div>

      <div className="field">
        <label>{t('common.date')}</label>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="card row between">
        <span className="small" style={{ fontWeight: 600 }}>{lang === 'ar' ? 'TVA قابلة للاسترجاع 19%' : 'TVA récupérable 19%'}{recoverable ? ` (TVA : ${tva.toFixed(1)} DT)` : ''}</span>
        <Toggle on={recoverable} onClick={() => setRecoverable((v) => !v)} />
      </div>

      <div className="field">
        <label>Note</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Plein gasoil" />
      </div>

      <button className="btn btn-primary btn-block" onClick={save} disabled={!amountNum}>{t('common.save')}</button>
      <button className="btn btn-ghost btn-block" onClick={() => navigate('/scanner')}>
        <Camera size={16} /> Scanner une facture à la place
      </button>
    </div>
  );
}

function categoryLabelFallback(id, lang) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c[lang === 'ar' ? 'ar' : 'fr'] : id;
}
