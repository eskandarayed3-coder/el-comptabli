import { useState } from 'react';
import { Plus, Trash2, TrendingUp, Info } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { appraiseInvestment } from '../../lib/financeRules.js';
import TopBar from '../../components/TopBar.jsx';

const pct = (n) => (n * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
const years = (n, unit) => (n == null ? '—' : `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ${unit}`);

export default function InvestmentCalculator() {
  const { t, lang } = useT();
  const [invest, setInvest] = useState('10000');
  const [rate, setRate] = useState('10');
  const [flows, setFlows] = useState(['3000', '4000', '5000', '4000']);

  const setFlow = (i, v) => setFlows((f) => f.map((x, j) => (j === i ? v : x)));
  const addYear = () => setFlows((f) => [...f, '']);
  const removeYear = (i) => setFlows((f) => (f.length > 1 ? f.filter((_, j) => j !== i) : f));

  const r = appraiseInvestment({
    invest: Number(invest) || 0,
    flows: flows.map((x) => Number(x) || 0),
    rate: (Number(rate) || 0) / 100,
  });

  const profitable = r.van >= 0;
  const U = { years: lang === 'ar' ? 'سنة' : 'ans', year: lang === 'ar' ? 'سنة' : 'année' };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('invest.title')} 📈`} />
      <p className="muted small">{t('invest.subtitle')}</p>

      <div className="row" style={{ gap: 10 }}>
        <div className="field grow">
          <label>{t('invest.initial')}</label>
          <input className="input num" type="number" inputMode="decimal" value={invest} onChange={(e) => setInvest(e.target.value)} placeholder="10000" />
        </div>
        <div className="field" style={{ width: 110 }}>
          <label>{t('invest.rate')}</label>
          <input className="input num" type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="10" />
        </div>
      </div>

      <div className="field">
        <label>{t('invest.flows')}</label>
        <div className="col" style={{ gap: 8 }}>
          {flows.map((cf, i) => (
            <div key={i} className="row" style={{ gap: 8 }}>
              <span className="pill teal num" style={{ flexShrink: 0, minWidth: 78, justifyContent: 'center' }}>{t('invest.year')} {i + 1}</span>
              <input className="input num grow" type="number" inputMode="decimal" value={cf} onChange={(e) => setFlow(i, e.target.value)} placeholder="0" />
              <button className="icon-btn" onClick={() => removeYear(i)} title={t('common.delete')}><Trash2 size={16} color="var(--pill-danger-fg)" /></button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={addYear}>
          <Plus size={16} /> {t('invest.addYear')}
        </button>
      </div>

      {/* Verdict banner — plain-language, first thing you read */}
      <div className={`card ${profitable ? 'tint-teal' : 'tint-coral'}`}>
        <div className="row" style={{ gap: 10, marginBottom: 6 }}>
          <TrendingUp size={18} color={profitable ? 'var(--teal-700)' : 'var(--pill-danger-fg)'} />
          <span className="small" style={{ fontWeight: 700 }}>{profitable ? t('invest.verdictGood') : t('invest.verdictBad')}</span>
        </div>
        <p className="tiny muted">{profitable ? t('invest.verdictGoodHint') : t('invest.verdictBadHint')}</p>
      </div>

      {/* The 5 indicators, each with a one-line plain meaning */}
      <div className="col" style={{ gap: 10 }}>
        <Indicator code="VAN" label={t('invest.van')} value={fmtDT(r.van, { sign: true, decimals: 0 })} hint={t('invest.vanHint')} strong tone={profitable ? 'teal' : 'coral'} />
        <Indicator code="TRI" label={t('invest.tri')} value={r.tri == null ? t('invest.na') : pct(r.tri)} hint={t('invest.triHint', { rate })} />
        <Indicator code="IP" label={t('invest.ip')} value={r.ip == null ? t('invest.na') : r.ip.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} hint={t('invest.ipHint')} />
        <Indicator code="DRCI" label={t('invest.drci')} value={years(r.drci, U.years)} hint={t('invest.drciHint')} />
        <Indicator code="DRA" label={t('invest.dra')} value={years(r.dra, U.years)} hint={t('invest.draHint')} />
      </div>

      {/* Year-by-year discounted table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th className="tiny" style={{ padding: 10, textAlign: 'start' }}>{t('invest.year')}</th>
                <th className="tiny" style={{ padding: 10, textAlign: 'end' }}>{t('invest.cashflow')}</th>
                <th className="tiny" style={{ padding: 10, textAlign: 'end' }}>{t('invest.discounted')}</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((row) => (
                <tr key={row.year} style={{ borderTop: '1px solid var(--bg-2)' }}>
                  <td className="small num" style={{ padding: 10 }}>{row.year}</td>
                  <td className="small num" style={{ padding: 10, textAlign: 'end' }}>{fmtDT(row.flow, { decimals: 0 })}</td>
                  <td className="small num" style={{ padding: 10, textAlign: 'end', fontWeight: 600 }}>{fmtDT(row.discounted, { decimals: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card tint-indigo">
        <div className="row" style={{ gap: 8, marginBottom: 4 }}>
          <Info size={15} color="#4F46E5" />
          <span className="tiny" style={{ fontWeight: 700 }}>{t('invest.tipTitle')}</span>
        </div>
        <p className="tiny muted">{t('invest.tipBody')}</p>
      </div>

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  );
}

function Indicator({ code, label, value, hint, strong, tone }) {
  return (
    <div className={`card ${strong ? `tint-${tone}` : ''}`} style={{ padding: 14 }}>
      <div className="row between" style={{ alignItems: 'baseline' }}>
        <div className="col" style={{ gap: 2 }}>
          <span className="small" style={{ fontWeight: 700 }}>{code} <span className="tiny muted" style={{ fontWeight: 400 }}>· {label}</span></span>
          <span className="tiny muted" style={{ maxWidth: 220 }}>{hint}</span>
        </div>
        <span className="num" style={{ fontWeight: 700, fontSize: strong ? 22 : 18, color: strong ? (tone === 'teal' ? 'var(--teal-700)' : 'var(--pill-danger-fg)') : 'var(--text)' }}>{value}</span>
      </div>
    </div>
  );
}
