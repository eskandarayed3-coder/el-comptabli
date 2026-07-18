import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { CNSS_CLASSES, SMIG_MENSUEL, CNSS_TNS_RATE, computeCNSS } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

export default function CnssCalculator() {
  const { t } = useT();
  const [classe, setClasse] = useState(1);
  const r = computeCNSS(classe);

  return (
    <div className="screen stagger">
      <TopBar title={t('cnss.title')} />
      <p className="muted small">{t('cnss.subtitle')}</p>

      <div className="field">
        <label>{t('cnss.classLabel')}</label>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {CNSS_CLASSES.map((c) => (
            <button
              key={c}
              className={`pill num ${classe === c ? 'teal' : ''}`}
              style={classe === c ? {} : { background: 'var(--bg-2)', color: 'var(--text-2)' }}
              onClick={() => setClasse(c)}
            >
              {c} × SMIG
            </button>
          ))}
        </div>
      </div>

      <div className="card tint-teal">
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <ShieldCheck size={18} color="var(--teal-700)" />
          <span className="small" style={{ fontWeight: 700 }}>{t('cnss.result')}</span>
        </div>
        <div className="col" style={{ gap: 8 }}>
          <div className="row between small">
            <span className="muted">{t('cnss.refIncome')}</span>
            <span className="num" style={{ fontWeight: 600 }}>{fmtDT(r.revenuMensuel, { decimals: 0 })} / {t('cnss.month')}</span>
          </div>
          <div className="row between small">
            <span className="muted">{t('cnss.monthly')}</span>
            <span className="num" style={{ fontWeight: 600 }}>{fmtDT(r.mensuel, { decimals: 0 })}</span>
          </div>
          <div className="row between" style={{ fontWeight: 700 }}>
            <span>{t('cnss.quarterly')}</span>
            <span className="num" style={{ color: 'var(--teal-700)', fontSize: 20 }}>{fmtDT(r.trimestriel, { decimals: 0 })}</span>
          </div>
          <div className="row between small">
            <span className="muted">{t('cnss.yearly')}</span>
            <span className="num" style={{ fontWeight: 600 }}>{fmtDT(r.annuel, { decimals: 0 })}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="tiny muted num">
          {t('cnss.formula', {
            smig: fmtDT(SMIG_MENSUEL, { decimals: 0 }),
            rate: (CNSS_TNS_RATE * 100).toLocaleString('fr-FR'),
          })}
        </p>
      </div>

      <div className="card tint-amber">
        <p className="small">{t('cnss.why')}</p>
      </div>

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  );
}
