import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { computeTVA, TVA_RATES } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

export default function VatCalculator() {
  const { state, add, toast } = useStore();
  const { t } = useT();
  const [direction, setDirection] = useState('HT_TO_TTC');
  const [amount, setAmount] = useState('1000');
  const [rate, setRate] = useState(19);

  const result = computeTVA({ amount: Number(amount) || 0, rate, direction });
  const history = (state.calcHistory || []).filter((h) => h.type === 'tva').slice(0, 3);

  const copy = () => {
    navigator.clipboard?.writeText(`HT ${result.ht.toFixed(3)} · TVA ${result.tva.toFixed(3)} · TTC ${result.ttc.toFixed(3)}`);
    add('calcHistory', { type: 'tva', at: new Date().toISOString(), ...result });
    toast(t('common.copied'));
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('tax.vatCalcTitle')} />
      <SegmentedControl
        options={[{ id: 'HT_TO_TTC', label: 'HT → TTC' }, { id: 'TTC_TO_HT', label: 'TTC → HT' }]}
        value={direction} onChange={setDirection}
      />
      <div className="field">
        <label>{t('common.amount')}</label>
        <input className="input num" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="field">
        <label>Taux</label>
        <div className="row" style={{ gap: 8 }}>
          {TVA_RATES.map((r) => (
            <button key={r} className={`chip ${rate === r ? 'active' : ''}`} onClick={() => setRate(r)}>{r}%</button>
          ))}
        </div>
      </div>

      <div className="card tint-teal">
        <div className="col" style={{ gap: 4 }}>
          <span className="num" style={{ fontWeight: 700 }}>
            {t('common.ht')} {fmtDT(result.ht)} · {t('common.tva')} {fmtDT(result.tva)} · {t('common.ttc')} {fmtDT(result.ttc)}
          </span>
          <span className="tiny muted num">{result.formula}</span>
        </div>
      </div>
      <button className="btn btn-ghost btn-block" onClick={copy}>{t('common.copy')}</button>

      {history.length > 0 && (
        <div className="col" style={{ gap: 6 }}>
          <h3>{t('tax.histCalc')}</h3>
          {history.map((h, i) => (
            <div key={i} className="small muted num">{fmtDT(h.ht)} → {fmtDT(h.ttc)}</div>
          ))}
        </div>
      )}
    </div>
  );
}
