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
      <TopBar title="Plus-value immobilière" />

      <div className="card tint-coral">
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={18} color="var(--pill-danger-fg)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p className="tiny">
            <strong>Cas standard uniquement</strong> (bien acheté, pas hérité ni donné, pas de résidence principale de plus de 1000 m²). Les montants immobiliers sont importants — <strong>consulte un expert-comptable ou un notaire avant toute déclaration réelle.</strong> Cet outil prépare tes chiffres, il ne remplace pas le formulaire officiel.
          </p>
        </div>
      </div>

      <div className="field">
        <label>Prix de cession (DT)</label>
        <input className="input num" type="number" min="0" value={prixCession} onChange={(e) => setPrixCession(e.target.value)} placeholder="300000" />
      </div>
      <div className="field">
        <label>Coût d’acquisition ou de construction (DT)</label>
        <input className="input num" type="number" min="0" value={coutAcquisition} onChange={(e) => setCoutAcquisition(e.target.value)} placeholder="100000" />
      </div>
      <div className="field">
        <label>Dépenses justifiées (travaux, DT)</label>
        <input className="input num" type="number" min="0" value={depenses} onChange={(e) => setDepenses(e.target.value)} placeholder="0" />
      </div>

      <div className="row" style={{ gap: 10 }}>
        <div className="field grow">
          <label>Année d’acquisition</label>
          <input className="input num" type="number" value={anneeAcquisition} onChange={(e) => setAnneeAcquisition(e.target.value)} />
        </div>
        <div className="field grow">
          <label>Année de cession</label>
          <input className="input num" type="number" value={anneeCession} onChange={(e) => setAnneeCession(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Taux d’imposition (%) — à vérifier avec ton comptable</label>
        <input className="input num" type="number" min="0" step="0.5" value={taux} onChange={(e) => setTaux(e.target.value)} style={{ maxWidth: 120 }} />
      </div>

      <div className="card">
        <div className="col" style={{ gap: 8 }}>
          <div className="row between small"><span className="muted">Durée de possession</span><span className="num">{r.years} an(s)</span></div>
          <div className="row between small"><span className="muted">Abattement 10%/an (coût)</span><span className="num">{fmtDT(r.abattementCout)}</span></div>
          <div className="row between small"><span className="muted">Abattement 10%/an (dépenses)</span><span className="num">{fmtDT(r.abattementDepenses)}</span></div>
        </div>
      </div>

      <div className="card tint-teal">
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="small" style={{ fontWeight: 700 }}>Plus-value imposable</span>
          <span className="num" style={{ fontWeight: 700 }}>{fmtDT(r.plusValue)}</span>
        </div>
        <div className="row between">
          <span className="small" style={{ fontWeight: 700 }}>Impôt estimé</span>
          <span className="num" style={{ fontWeight: 800, fontSize: 22, color: 'var(--teal-700)' }}>{fmtDT(r.impot)}</span>
        </div>
      </div>

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  );
}
