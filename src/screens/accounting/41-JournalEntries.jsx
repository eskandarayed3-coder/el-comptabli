import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, fmtDate, todayISO } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import FAB from '../../components/FAB.jsx';
import Sheet from '../../components/Sheet.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

export default function JournalEntries() {
  const { state, add, remove, toast } = useStore();
  const { t, lang } = useT();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState('income');
  const [amountHT, setAmountHT] = useState('');
  const [tvaRate, setTvaRate] = useState(19);
  const ym = new Date().toISOString().slice(0, 7);

  const entries = state.transactions
    .filter((tx) => tx.date.startsWith(ym))
    .filter((tx) => filter === 'all' || (filter === 'sales' ? tx.kind === 'income' : filter === 'purchases' ? tx.kind === 'expense' : true));

  const save = () => {
    const ht = Number(amountHT) || 0;
    if (!label.trim() || !ht) return;
    const tva = ht * (tvaRate / 100);
    add('transactions', {
      kind, label: label.trim(), vendor: label.trim(), category: kind === 'income' ? 'ventes' : 'autres',
      date: todayISO(), amountHT: ht, tva, amountTTC: ht + tva,
    });
    toast(t('common.saved'));
    setOpen(false);
    setLabel(''); setAmountHT(''); setKind('income');
  };

  const del = (id) => { remove('transactions', id); toast(t('common.deleted')); };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('accounting.journal')} · Juillet`} />
      <FilterPills
        options={[{ id: 'all', label: t('common.all') }, { id: 'sales', label: 'Ventes' }, { id: 'purchases', label: 'Achats' }, { id: 'bank', label: 'Banque' }]}
        value={filter} onChange={setFilter}
      />
      <div className="col" style={{ gap: 10 }}>
        {entries.map((tx) => {
          const isIncome = tx.kind === 'income';
          return (
            <div key={tx.id} className="card inner">
              <div className="row between small">
                <span style={{ fontWeight: 600 }}>{tx.label}</span>
                <span className="row" style={{ gap: 8 }}>
                  <span className="tiny muted">{fmtDate(tx.date, lang)}</span>
                  <button onClick={() => del(tx.id)} title={t('common.delete')}><Trash2 size={14} color="var(--pill-danger-fg)" /></button>
                </span>
              </div>
              <div className="col tiny num" style={{ marginTop: 8, gap: 2 }}>
                {isIncome ? (
                  <>
                    <span>411 Clients · {t('accounting.debit')} {fmtDT(tx.amountTTC)}</span>
                    <span>707 Ventes · {t('accounting.credit')} {fmtDT(tx.amountHT)} · 4367 TVA collectée · {t('accounting.credit')} {fmtDT(tx.tva)}</span>
                  </>
                ) : (
                  <>
                    <span>60x Achats · {t('accounting.debit')} {fmtDT(tx.amountHT)} · 4366 TVA déductible · {t('accounting.debit')} {fmtDT(tx.tva)}</span>
                    <span>401 Fournisseurs · {t('accounting.credit')} {fmtDT(tx.amountTTC)}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <FAB icon={Plus} label={`+ ${t('accounting.entry')}`} onClick={() => setOpen(true)} />

      <Sheet open={open} onClose={() => setOpen(false)}>
        <h3 style={{ marginBottom: 16 }}>{`+ ${t('accounting.entry')}`}</h3>
        <div className="col" style={{ gap: 14 }}>
          <div className="field">
            <label>Libellé</label>
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Vente client Wafa" />
          </div>
          <div className="field">
            <label>Type</label>
            <SegmentedControl options={[{ id: 'income', label: 'Vente' }, { id: 'expense', label: 'Achat' }]} value={kind} onChange={setKind} />
          </div>
          <div className="field">
            <label>Montant HT</label>
            <input className="input num" type="number" value={amountHT} onChange={(e) => setAmountHT(e.target.value)} placeholder="1000" />
          </div>
          <div className="field">
            <label>Taux TVA</label>
            <div className="row" style={{ gap: 8 }}>
              {[19, 13, 7, 0].map((r) => (
                <button key={r} className={`chip ${tvaRate === r ? 'active' : ''}`} onClick={() => setTvaRate(r)}>{r}%</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={save} disabled={!label.trim() || !Number(amountHT)}>{t('common.save')}</button>
        </div>
      </Sheet>
    </div>
  );
}
