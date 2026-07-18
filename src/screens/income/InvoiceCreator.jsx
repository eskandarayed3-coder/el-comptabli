import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Printer, Save } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDT, todayISO, uid } from '../../lib/format.js';
import { TVA_RATES } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';

const TIMBRE_FISCAL = 1; // DT — droit de timbre par facture (indicatif, LF en vigueur)

const emptyLine = () => ({ id: uid(), desc: '', qty: 1, price: '', rate: 19 });

export default function InvoiceCreator() {
  const navigate = useNavigate();
  const { state, add, patch, toast, logActivity } = useStore();
  const { t } = useT();

  const [client, setClient] = useState('');
  const [mf, setMf] = useState('');
  const [date, setDate] = useState(todayISO());
  const [lines, setLines] = useState([emptyLine()]);
  const [withTva, setWithTva] = useState(state.profile?.regime !== 'forfaitaire');
  const [withTimbre, setWithTimbre] = useState(true);

  const seq = (state.settings.invoiceSeq || 0) + 1;
  const number = `FAC-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;

  const totals = useMemo(() => {
    let ht = 0;
    let tva = 0;
    for (const l of lines) {
      const lineHT = (Number(l.qty) || 0) * (Number(l.price) || 0);
      ht += lineHT;
      if (withTva) tva += lineHT * (Number(l.rate) || 0) / 100;
    }
    const timbre = withTimbre ? TIMBRE_FISCAL : 0;
    return { ht, tva, timbre, ttc: ht + tva + timbre };
  }, [lines, withTva, withTimbre]);

  const setLine = (id, data) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...data } : l)));
  const removeLine = (id) => setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.id !== id) : ls));

  const valid = client.trim() && totals.ht > 0;

  const save = () => {
    if (!valid) return;
    add('transactions', {
      kind: 'income',
      vendor: client.trim(),
      label: `${t('invoice.label')} ${number}`,
      category: 'ventes',
      date,
      amountHT: Math.round(totals.ht * 1000) / 1000,
      tva: Math.round(totals.tva * 1000) / 1000,
      amountTTC: Math.round(totals.ttc * 1000) / 1000,
      invoice: { number, mf: mf.trim(), lines, withTva, timbre: totals.timbre },
    });
    add('documents', { name: `${number} · ${client.trim()}.pdf`, type: 'facture', date, size: 'N/D' });
    patch('settings', { invoiceSeq: seq });
    logActivity(`${t('invoice.label')} ${number} · ${client.trim()}`, 'FileText');
    toast(t('invoice.saved', { number }));
    navigate('/income');
  };

  return (
    <div className="screen stagger">
      <TopBar title={`${t('invoice.title')} 🧾`} />

      <div className="card tint-indigo row between">
        <span className="small" style={{ fontWeight: 700 }}>{number}</span>
        <span className="tiny muted num">{date}</span>
      </div>

      <div className="field">
        <label>{t('invoice.client')}</label>
        <input className="input" value={client} onChange={(e) => setClient(e.target.value)} placeholder={t('invoice.clientPh')} />
      </div>
      <div className="row" style={{ gap: 10 }}>
        <div className="field grow">
          <label>{t('invoice.mf')}</label>
          <input className="input num" value={mf} onChange={(e) => setMf(e.target.value)} placeholder="0000000A/A/M/000" />
        </div>
        <div className="field">
          <label>{t('common.date')}</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <h3>{t('invoice.items')}</h3>
      <div className="col" style={{ gap: 10 }}>
        {lines.map((l) => (
          <div key={l.id} className="card inner col" style={{ gap: 8 }}>
            <input className="input" value={l.desc} onChange={(e) => setLine(l.id, { desc: e.target.value })} placeholder={t('invoice.desc')} />
            <div className="row" style={{ gap: 8 }}>
              <input className="input num" type="number" min="1" style={{ width: 64 }} value={l.qty} onChange={(e) => setLine(l.id, { qty: e.target.value })} title={t('invoice.qty')} />
              <input className="input num grow" type="number" min="0" step="0.001" value={l.price} onChange={(e) => setLine(l.id, { price: e.target.value })} placeholder={`${t('invoice.unitPrice')} (DT)`} />
              {withTva && (
                <select className="input num" style={{ width: 86 }} value={l.rate} onChange={(e) => setLine(l.id, { rate: Number(e.target.value) })}>
                  {TVA_RATES.concat(0).map((r) => <option key={r} value={r}>{r}%</option>)}
                </select>
              )}
              <button className="icon-btn" onClick={() => removeLine(l.id)} title={t('common.delete')}><Trash2 size={16} color="var(--pill-danger-fg)" /></button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={() => setLines((ls) => [...ls, emptyLine()])}>
        <Plus size={16} /> {t('invoice.addLine')}
      </button>

      <div className="card row between">
        <span className="small" style={{ fontWeight: 600 }}>{t('invoice.withTva')}</span>
        <Toggle on={withTva} onClick={() => setWithTva((v) => !v)} />
      </div>
      <div className="card row between">
        <span className="small" style={{ fontWeight: 600 }}>{t('invoice.timbre')} ({fmtDT(TIMBRE_FISCAL, { decimals: 0 })})</span>
        <Toggle on={withTimbre} onClick={() => setWithTimbre((v) => !v)} />
      </div>

      <div className="card tint-teal col" style={{ gap: 6 }}>
        <div className="row between small"><span className="muted">{t('common.ht')}</span><span className="num">{fmtDT(totals.ht)}</span></div>
        {withTva && <div className="row between small"><span className="muted">{t('common.tva')}</span><span className="num">{fmtDT(totals.tva)}</span></div>}
        {withTimbre && <div className="row between small"><span className="muted">{t('invoice.timbre')}</span><span className="num">{fmtDT(totals.timbre)}</span></div>}
        <div className="row between" style={{ fontWeight: 700 }}>
          <span>{t('common.ttc')}</span>
          <span className="num" style={{ color: 'var(--teal-700)', fontSize: 20 }}>{fmtDT(totals.ttc)}</span>
        </div>
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-primary grow" disabled={!valid} onClick={save}><Save size={16} /> {t('invoice.save')}</button>
        <button className="btn btn-ghost" disabled={!valid} onClick={() => window.print()}><Printer size={16} /> {t('invoice.print')}</button>
      </div>

      {/* Printable A4-style view, revealed only by @media print (see components.css). */}
      <div className="invoice-print" dir="ltr">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0 }}>{state.profile?.name || 'El Comptabli'}</h2>
            <p style={{ margin: '4px 0', fontSize: 13 }}>{state.profile?.activity || ''} {state.profile?.city ? `· ${state.profile.city}` : ''}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0 }}>{t('invoice.label')} {number}</h3>
            <p style={{ margin: '4px 0', fontSize: 13 }}>{date}</p>
          </div>
        </div>
        <p style={{ fontSize: 14 }}><strong>{t('invoice.client')} :</strong> {client} {mf ? `· MF ${mf}` : ''}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16, fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left', padding: 6 }}>{t('invoice.desc')}</th>
              <th style={{ textAlign: 'right', padding: 6 }}>{t('invoice.qty')}</th>
              <th style={{ textAlign: 'right', padding: 6 }}>{t('invoice.unitPrice')}</th>
              {withTva && <th style={{ textAlign: 'right', padding: 6 }}>TVA</th>}
              <th style={{ textAlign: 'right', padding: 6 }}>{t('common.ht')}</th>
            </tr>
          </thead>
          <tbody>
            {lines.filter((l) => l.desc || l.price).map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: 6 }}>{l.desc}</td>
                <td style={{ textAlign: 'right', padding: 6 }}>{l.qty}</td>
                <td style={{ textAlign: 'right', padding: 6 }}>{fmtDT(Number(l.price) || 0)}</td>
                {withTva && <td style={{ textAlign: 'right', padding: 6 }}>{l.rate}%</td>}
                <td style={{ textAlign: 'right', padding: 6 }}>{fmtDT((Number(l.qty) || 0) * (Number(l.price) || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, marginLeft: 'auto', width: 260, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 4 }}><span>{t('common.ht')}</span><span>{fmtDT(totals.ht)}</span></div>
          {withTva && <div style={{ display: 'flex', justifyContent: 'space-between', padding: 4 }}><span>{t('common.tva')}</span><span>{fmtDT(totals.tva)}</span></div>}
          {withTimbre && <div style={{ display: 'flex', justifyContent: 'space-between', padding: 4 }}><span>{t('invoice.timbre')}</span><span>{fmtDT(totals.timbre)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 6, borderTop: '2px solid #333', fontWeight: 700 }}><span>{t('common.ttc')}</span><span>{fmtDT(totals.ttc)}</span></div>
        </div>
      </div>
    </div>
  );
}
