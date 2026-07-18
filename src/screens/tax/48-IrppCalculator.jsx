import { useState } from 'react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { computeIRPP, BAREME_YEAR } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import Stepper from '../../components/Stepper.jsx';

export default function IrppCalculator() {
  const { t } = useT();
  const [net, setNet] = useState('24000');
  const [situation, setSituation] = useState('single');
  const [children, setChildren] = useState(0);
  const [disabledChildren, setDisabledChildren] = useState(0);
  const [parents, setParents] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [result, setResult] = useState(null);

  const calculate = () => setResult(computeIRPP(Number(net) || 0, {
    chefFamille: situation === 'family',
    enfants: children,
    enfantsHandicapes: disabledChildren,
    parentsACharge: parents,
  }));

  return (
    <div className="screen stagger">
      <TopBar title={t('tax.irppCalcTitle')} />
      <div className="field">
        <label>{t('tax.netAnnual')}</label>
        <input className="input num" type="number" value={net} onChange={(e) => setNet(e.target.value)} />
      </div>
      <div className="field">
        <label>Situation</label>
        <div className="row" style={{ gap: 8 }}>
          <button className={`chip ${situation === 'single' ? 'active' : ''}`} onClick={() => setSituation('single')}>{t('tax.single')}</button>
          <button className={`chip ${situation === 'family' ? 'active' : ''}`} onClick={() => setSituation('family')}>{t('tax.familyHead')}</button>
        </div>
      </div>
      <div className="field row between">
        <label style={{ marginBottom: 0 }}>{t('tax.children')}</label>
        <Stepper value={children} onChange={setChildren} max={4} />
      </div>
      <div className="field row between">
        <label style={{ marginBottom: 0 }}>{t('tax.disabledChildren')}</label>
        <Stepper value={disabledChildren} onChange={setDisabledChildren} max={10} />
      </div>
      <div className="field row between">
        <label style={{ marginBottom: 0 }}>{t('tax.dependentParents')}</label>
        <Stepper value={parents} onChange={setParents} max={2} />
      </div>

      <button className="btn btn-primary btn-block" onClick={calculate}>{t('tax.calculate')}</button>

      {result && (
        <>
          <div className="card tint-amber">
            <span className="num" style={{ fontSize: 22, fontWeight: 700 }}>{t('tax.irppResult', { amount: fmtDT(result.total, { decimals: 0 }) })}</span>
          </div>
          <button className="small" style={{ color: 'var(--teal-700)', alignSelf: 'flex-start' }} onClick={() => setShowDetail((v) => !v)}>
            {t('tax.bracketDetail')} {showDetail ? '▲' : '▼'}
          </button>
          {showDetail && (
            <div className="card inner" style={{ background: 'var(--bg-2)' }}>
              <div className="col" style={{ gap: 6 }}>
                {result.lines.filter((l) => l.base > 0).map((l, i) => (
                  <div key={i} className="row between small num">
                    <span>{l.base.toLocaleString('fr-FR')} × {Math.round(l.rate * 100)}%</span>
                    <span style={{ fontWeight: 600 }}>{fmtDT(l.tax, { decimals: 0 })}</span>
                  </div>
                ))}
                <div className="row between small num" style={{ borderTop: '1px solid var(--hairline)', paddingTop: 6, marginTop: 2 }}>
                  <span>{t('tax.grossTax')}</span>
                  <span style={{ fontWeight: 600 }}>{fmtDT(result.gross, { decimals: 0 })}</span>
                </div>
                {result.deductionDetail.map((d, i) => (
                  <div key={i} className="row between small num" style={{ color: 'var(--pill-success-fg)' }}>
                    <span>{d.label}</span>
                    <span style={{ fontWeight: 600 }}>− {fmtDT(d.amount, { decimals: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="disclaimer">{t('tax.indicativeBareme', { year: BAREME_YEAR })}</p>
        </>
      )}
    </div>
  );
}
