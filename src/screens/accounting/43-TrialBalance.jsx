import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

const DRILLABLE = ['411', '401']; // accounts with a General Ledger view

export default function TrialBalance() {
  const navigate = useNavigate();
  const { state, toast } = useStore();
  const { t } = useT();
  const ym = new Date().toISOString().slice(0, 7);

  const rows = useMemo(() => {
    const tx = state.transactions.filter((x) => x.date.startsWith(ym));
    const clients = tx.filter((x) => x.kind === 'income').reduce((s, x) => s + x.amountTTC, 0);
    const ventes = tx.filter((x) => x.kind === 'income').reduce((s, x) => s + x.amountHT, 0);
    const tvaCollectee = tx.filter((x) => x.kind === 'income').reduce((s, x) => s + x.tva, 0);
    const fournisseurs = tx.filter((x) => x.kind === 'expense').reduce((s, x) => s + x.amountTTC, 0);
    const achats = tx.filter((x) => x.kind === 'expense').reduce((s, x) => s + x.amountHT, 0);
    const tvaDeductible = tx.filter((x) => x.kind === 'expense').reduce((s, x) => s + x.tva, 0);
    return [
      { num: '411', label: 'Clients', debit: clients, credit: 0 },
      { num: '401', label: 'Fournisseurs', debit: 0, credit: fournisseurs },
      { num: '607', label: 'Achats', debit: achats, credit: 0 },
      { num: '707', label: 'Ventes', debit: 0, credit: ventes },
      { num: '4366', label: 'TVA déductible', debit: tvaDeductible, credit: 0 },
      { num: '4367', label: 'TVA collectée', debit: 0, credit: tvaCollectee },
    ];
  }, [state.transactions, ym]);

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('accounting.trial')} · Juillet 2026`} />
      <div className="card tint-teal">
        <span className="small num" style={{ fontWeight: 700 }}>
          {t('accounting.debit')} {fmtDT(totalDebit, { decimals: 0 })} = {t('accounting.credit')} {fmtDT(totalCredit, { decimals: 0 })} ✓
        </span>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--bg-2)' }}>
            {['N°', 'Libellé', t('accounting.debit'), t('accounting.credit')].map((h) => <th key={h} className="tiny" style={{ padding: 10, textAlign: 'start' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const drillable = DRILLABLE.includes(r.num);
              return (
                <tr
                  key={r.num}
                  style={{ borderTop: '1px solid var(--bg-2)', cursor: drillable ? 'pointer' : 'default' }}
                  onClick={drillable ? () => navigate(`/accounting/ledger?account=${r.num}`) : undefined}
                >
                  <td className="small num" style={{ padding: 10, color: drillable ? 'var(--teal-700)' : 'inherit', fontWeight: drillable ? 600 : 400 }}>{r.num}</td>
                  <td className="small" style={{ padding: 10 }}>{r.label}</td>
                  <td className="small num" style={{ padding: 10 }}>{r.debit ? fmtDT(r.debit, { decimals: 0 }) : ''}</td>
                  <td className="small num" style={{ padding: 10 }}>{r.credit ? fmtDT(r.credit, { decimals: 0 }) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="tiny muted">Balance calculée automatiquement depuis le journal. Modifie une écriture dans le Journal pour la changer. Touche un compte 411/401 pour voir son détail.</p>
      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-ghost grow" onClick={() => navigate('/documents/export')}>Excel</button>
        <button className="btn btn-ghost grow" onClick={() => navigate('/documents/export')}>PDF</button>
      </div>
    </div>
  );
}
