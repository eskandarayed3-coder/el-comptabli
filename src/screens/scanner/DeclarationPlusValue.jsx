import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import { computePlusValue } from '../../lib/plusValueRules.js';
import TopBar from '../../components/TopBar.jsx';

const thisYear = new Date().getFullYear();

export default function DeclarationPlusValue() {
  const { t } = useT();
  const [prixCession, setPrixCession] = useState('');
  const [coutAcquisition, setCoutAcquisition] = useState('');
  const [depenses, setDepenses] = useState('');
  const [anneeAcquisition, setAnneeAcquisition] = useState(String(thisYear - 5));
  const [anneeCession, setAnneeCession] = useState(String(thisYear));
  const [taux, setTaux] = useState('10');

  const r = useMemo(
    () => computePlusValue({ prixCession, coutAcquisition, depenses, anneeAcquisition, anneeCession, taux }),
    [prixCession, coutAcquisition, depenses, anneeAcquisition, anneeCession, taux],
  );

  return (
    <div className="screen stagger">
      <TopBar title={t('declPlusValue.title')} />

      <div className="card tint-coral">
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="var(--pill-danger-fg)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="tiny">
            <strong>{t('declPlusValue.warningStrong')}</strong> {t('declPlusValue.warning')} <strong>{t('declPlusValue.warningStrong2')}</strong> {t('declPlusValue.warningNote')}
          </p>
        </div>
      </div>

      <div className="field">
        <label>{t('declPlusValue.prixCession')}</label>
        <input className="input num" type="number" min="0" value={prixCession} onChange={(e) => setPrixCession(e.target.value)} placeholder="300000" />
      </div>
      <div className="field">
        <label>{t('declPlusValue.coutAcquisition')}</label>
        <input className="input num" type="number" min="0" value={coutAcquisition} onChange={(e) => setCoutAcquisition(e.target.value)} placeholder="100000" />
      </div>
      <div className="field">
        <label>{t('declPlusValue.depenses')}</label>
        <input className="input num" type="number" min="0" value={depenses} onChange={(e) => setDepenses(e.target.value)} placeholder="0" />
      </div>

      <div className="row" style={{ gap: 10 }}>
        <div className="field grow">
          <label>{t('declPlusValue.anneeAcquisition')}</label>
          <input className="input num" type="number" value={anneeAcquisition} onChange={(e) => setAnneeAcquisition(e.target.value)} />
        </div>
        <div className="field grow">
          <label>{t('declPlusValue.anneeCession')}</label>
          <input className="input num" type="number" value={anneeCession} onChange={(e) => setAnneeCession(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>{t('declPlusValue.taux')}</label>
        <input className="input num" type="number" min="0" step="0.5" value={taux} onChange={(e) => setTaux(e.target.value)} style={{ maxWidth: 120 }} />
      </div>

      <div className="card">
        <div className="col" style={{ gap: 8 }}>
          <div className="row between small"><span className="muted">{t('declPlusValue.duree')}</span><span className="num">{r.years} {t('declPlusValue.years')}</span></div>
          <div className="row between small"><span className="muted">{t('declPlusValue.abattementCout')}</span><span className="num">{fmtDT(r.abattementCout)}</span></div>
          <div className="row between small"><span className="muted">{t('declPlusValue.abattementDepenses')}</span><span className="num">{fmtDT(r.abattementDepenses)}</span></div>
        </div>
      </div>

      <div className="card tint-teal">
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="small" style={{ fontWeight: 700 }}>{t('declPlusValue.plusValue')}</span>
          <span className="num" style={{ fontWeight: 700 }}>{fmtDT(r.plusValue)}</span>
        </div>
        <div className="row between">
          <span className="small" style={{ fontWeight: 700 }}>{t('declPlusValue.impot')}</span>
          <span className="num" style={{ fontWeight: 800, fontSize: 22, color: 'var(--teal-700)' }}>{fmtDT(r.impot)}</span>
        </div>
      </div>

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  );
}
