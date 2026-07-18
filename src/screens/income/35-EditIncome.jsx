import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

export default function EditIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, update, toast } = useStore();
  const { t, lang } = useT();
  const tx = state.transactions.find((x) => x.id === id);
  const [amount, setAmount] = useState(tx?.amountTTC ?? 0);
  const [client, setClient] = useState(tx?.vendor ?? '');
  const [status, setStatus] = useState(tx?.status === 'pending' ? 'pending' : 'paid');

  if (!tx) return null;

  const save = () => {
    update('transactions', tx.id, { amountTTC: Number(amount), vendor: client, label: client, status });
    toast(t('common.saved'));
    navigate(`/income/${tx.id}`);
  };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('common.edit')} · ${t('common.income')}`} />
      <div className="center" style={{ padding: '20px 0' }}>
        <input
          className="num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
          style={{ border: 'none', background: 'transparent', fontSize: 48, fontWeight: 700, textAlign: 'center', width: '60%', color: 'var(--teal-700)' }}
        />
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--teal-700)' }}> DT</span>
      </div>
      <div className="field">
        <label>{t('money.client')}</label>
        <input className="input" value={client} onChange={(e) => setClient(e.target.value)} />
      </div>
      <div className="field">
        <label>Statut</label>
        <SegmentedControl options={[{ id: 'paid', label: t('common.paid') }, { id: 'pending', label: t('common.upcoming') }]} value={status} onChange={setStatus} />
      </div>
      <p className="tiny muted">Créé le {fmtDate(tx.date, lang)} · Modifié jamais</p>
      <button className="btn btn-primary btn-block" onClick={save}>{t('common.save')} les modifications</button>
      <button className="btn btn-ghost btn-block" onClick={() => navigate(-1)}>{t('common.cancel')}</button>
    </div>
  );
}
