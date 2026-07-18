import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { estimateTaxes } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import StatCard from '../../components/StatCard.jsx';

export default function TaxEstimation() {
  const { state } = useStore();
  const { t } = useT();
  const [tab, setTab] = useState('irpp');
  const [ca, setCa] = useState('24000');
  const [charges, setCharges] = useState('6000');
  const [regime, setRegime] = useState(state.profile.regime === 'forfaitaire' ? 'forfaitaire' : 'reel');
  const [showDetail, setShowDetail] = useState(false);
  const [result, setResult] = useState(null);

  const estimate = () => setResult(estimateTaxes({ caAnnual: Number(ca) || 0, charges: Number(charges) || 0, regime }));

  return (
    <div className="screen stagger">
      <TopBar title={t('tax.estimTitle')} />
      <SegmentedControl options={[{ id: 'tva', label: 'TVA' }, { id: 'irpp', label: 'IRPP' }]} value={tab} onChange={setTab} />

      <div className="card">
        <div className="col" style={{ gap: 14 }}>
          <div className="field">
            <label>{t('tax.caAnnual')}</label>
            <input className="input num" type="number" value={ca} onChange={(e) => setCa(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('tax.charges')}</label>
            <input className="input num" type="number" value={charges} onChange={(e) => setCharges(e.target.value)} />
          </div>
          <div className="field">
            <label>Régime</label>
            <SegmentedControl
              options={[{ id: 'reel', label: 'Réel' }, { id: 'forfaitaire', label: 'Forfaitaire' }]}
              value={regime} onChange={setRegime}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={estimate}>{t('tax.estimate')}</button>

      {result && (
        <>
          <div className="grid-3">
            <StatCard label="TVA" value={fmtDT(result.tva, { decimals: 0 })} tone="indigo" />
            <StatCard label="IRPP" value={fmtDT(result.irpp, { decimals: 0 })} tone="amber" />
            <StatCard label={t('tax.net')} value={fmtDT(result.net, { decimals: 0 })} tone="teal" />
          </div>
          <button className="small" style={{ color: 'var(--teal-700)', alignSelf: 'flex-start' }} onClick={() => setShowDetail((v) => !v)}>
            {t('tax.calcDetail')} {showDetail ? '▲' : '▼'}
          </button>
          {showDetail && (
            <div className="card inner" style={{ background: 'var(--bg-2)' }}>
              {result.lines.map((l, i) => <p key={i} className="small num">{l}</p>)}
            </div>
          )}
          <p className="disclaimer">{t('tax.indicativeLong')}</p>
        </>
      )}
    </div>
  );
}
