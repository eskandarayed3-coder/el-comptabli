import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { WITHHOLDING_CATEGORIES } from '../../lib/withholdingRules.js';
import TopBar from '../../components/TopBar.jsx';

const monthNow = new Date().toISOString().slice(0, 7);

export default function DeclarationMensuelle() {
  const { t } = useT();
  const [month, setMonth] = useState(monthNow);
  const [rows, setRows] = useState(
    () => Object.fromEntries(WITHHOLDING_CATEGORIES.map((c) => [c.id, { base: '', rate: String(c.defaultRate) }])),
  );

  const setRow = (id, field, value) => setRows((r) => ({ ...r, [id]: { ...r[id], [field]: value } }));

  const lines = useMemo(
    () => WITHHOLDING_CATEGORIES.map((c) => {
      const base = Number(rows[c.id].base) || 0;
      const rate = Number(rows[c.id].rate) || 0;
      return { ...c, base, rate, montant: base * (rate / 100) };
    }),
    [rows],
  );
  const total = lines.reduce((s, l) => s + l.montant, 0);

  return (
    <div className="screen stagger">
      <TopBar title={t('declMensuelle.title')} />

      <div className="card tint-amber">
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="var(--pill-warning-fg)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="tiny">{t('declMensuelle.warning')}</p>
        </div>
      </div>

      <div className="field">
        <label>{t('common.date')}</label>
        <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div className="col" style={{ gap: 10 }}>
        {lines.map((l) => (
          <div key={l.id} className="card inner col" style={{ gap: 8 }}>
            <span className="small" style={{ fontWeight: 600 }}>{t(`declMensuelle.${l.labelKey}`)}</span>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input num grow" type="number" min="0" step="0.001"
                value={rows[l.id].base} onChange={(e) => setRow(l.id, 'base', e.target.value)}
                placeholder={t('declMensuelle.base')}
              />
              <div className="row" style={{ gap: 4, alignItems: 'center', flexShrink: 0 }}>
                <input
                  className="input num" type="number" min="0" step="0.1" style={{ width: 70 }}
                  value={rows[l.id].rate} onChange={(e) => setRow(l.id, 'rate', e.target.value)}
                />
                <span className="small muted">%</span>
              </div>
            </div>
            {l.montant > 0 && <span className="tiny muted num">= {fmtDT(l.montant)} {t('declMensuelle.montant')}</span>}
          </div>
        ))}
      </div>

      <div className="card tint-teal">
        <div className="row between">
          <span className="small" style={{ fontWeight: 700 }}>{t('declMensuelle.total')}</span>
          <span className="num" style={{ fontWeight: 800, fontSize: 22, color: 'var(--teal-700)' }}>{fmtDT(total)}</span>
        </div>
      </div>

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  );
}
