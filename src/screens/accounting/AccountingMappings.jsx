import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import { useStore } from '../../lib/store.jsx';
import { v1 } from '../../lib/api.js';
import { fmtDT, fmtDate } from '../../lib/format.js';
import { buildPostingPreview, expectedJournalType, mappingPayload } from '../../lib/accountingMapping.js';

const EMPTY_SELECTION = { journalId: '', targetAccountId: '', counterpartyAccountId: '', vatAccountId: '' };
const ALLOWED_ROLES = new Set(['owner', 'admin', 'accountant']);

export default function AccountingMappings() {
  const { state } = useStore();
  const role = state.organization?.role;
  const canApprove = ALLOWED_ROLES.has(role);
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [invoiceId, setInvoiceId] = useState('');
  const [selection, setSelection] = useState(EMPTY_SELECTION);
  const [mappingId, setMappingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [invoiceResult, accountResult, journalResult] = await Promise.all([
        v1('/invoices?limit=100'), v1('/accounts?limit=500'), v1('/journals?limit=100'),
      ]);
      const pending = (invoiceResult.data || []).filter((invoice) => ['confirmed', 'paid'].includes(invoice.status) && invoice.accounting_status !== 'posted');
      setInvoices(pending);
      setAccounts((accountResult.data || []).filter((account) => account.is_active !== false));
      setJournals((journalResult.data || []).filter((journal) => journal.active !== false));
      setInvoiceId((current) => pending.some((invoice) => invoice.id === current) ? current : (pending[0]?.id || ''));
    } catch (requestError) {
      setLoadError(requestError.friendly?.message || requestError.message || 'Chargement impossible. Réessaie.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const invoice = invoices.find((item) => item.id === invoiceId);
  const compatibleJournals = journals.filter((journal) => !invoice || journal.type === expectedJournalType(invoice));
  const preview = useMemo(() => {
    if (!invoice || !selection.journalId || !selection.targetAccountId || !selection.counterpartyAccountId) return null;
    try { return buildPostingPreview(invoice, selection, accounts); } catch (previewError) { return { error: previewError.message }; }
  }, [accounts, invoice, selection]);

  const changeInvoice = (event) => {
    setInvoiceId(event.target.value);
    setSelection(EMPTY_SELECTION);
    setMappingId('');
    setActionError('');
    setSuccess('');
  };
  const set = (field) => (event) => {
    setSelection((current) => ({ ...current, [field]: event.target.value }));
    setMappingId('');
    setActionError('');
    setSuccess('');
  };

  const post = async () => {
    if (!invoice || posting || !preview?.balanced) return;
    setPosting(true);
    setActionError('');
    setSuccess('');
    try {
      let approvedMappingId = mappingId;
      if (!approvedMappingId) {
        const created = await v1('/accounting-mappings', { method: 'POST', body: JSON.stringify(mappingPayload(invoice, selection)) });
        approvedMappingId = created.data.id;
        setMappingId(approvedMappingId);
      }
      const result = await v1(`/invoices/${invoice.id}/accounting-validation`, {
        method: 'POST', body: JSON.stringify({ mappingId: approvedMappingId }),
      });
      setSuccess(result.idempotent ? 'Cette facture était déjà comptabilisée. Aucune écriture dupliquée.' : 'Facture validée et comptabilisée avec succès.');
      await load();
    } catch (requestError) {
      setActionError(requestError.friendly?.message || requestError.message || 'Comptabilisation impossible. Vérifie les comptes sélectionnés.');
    } finally {
      setPosting(false);
    }
  };

  if (!canApprove) {
    return <div className="screen stagger"><TopBar title="Mapping comptable" /><div className="card tint-amber"><strong>Accès réservé</strong><p className="small muted">Un propriétaire, administrateur ou comptable doit valider les imputations.</p></div></div>;
  }

  return (
    <div className="screen stagger">
      <TopBar title="Mapping comptable" />
      <div className="card tint-amber col" style={{ gap: 6 }}>
        <strong className="small">Validation professionnelle requise</strong>
        <span className="tiny muted">Aucun compte tunisien n’est choisi automatiquement. Le comptable garde la décision finale.</span>
      </div>
      {loading && <div className="card center"><Loader2 className="spin" size={22} /><span className="small muted">Chargement des factures…</span></div>}
      {!loading && loadError && <div className="card tint-coral col"><span className="small" role="alert">{loadError}</span><button className="btn btn-ghost btn-sm" onClick={load}>Réessayer</button></div>}
      {!loading && !loadError && !invoices.length && (
        <div className="card tint-teal center col" style={{ gap: 8 }}><CheckCircle2 size={26} color="var(--teal-700)" /><strong>Aucune facture à comptabiliser</strong><span className="tiny muted">Les factures confirmées en attente apparaîtront ici.</span></div>
      )}
      {!loading && invoices.length > 0 && (
        <>
          <div className="field">
            <label htmlFor="mapping-invoice">Facture à traiter</label>
            <select id="mapping-invoice" className="input" value={invoiceId} onChange={changeInvoice}>
              {invoices.map((item) => <option key={item.id} value={item.id}>{item.invoice_number} · {item.supplier || item.third_parties?.name || 'Tiers non renseigné'}</option>)}
            </select>
          </div>
          {invoice && (
            <div className="card inner col" style={{ gap: 10 }}>
              <div className="row between"><strong>{invoice.supplier || invoice.third_parties?.name || 'Tiers non renseigné'}</strong><StatusPill tone="warning">À comptabiliser</StatusPill></div>
              <div className="grid-3">
                <div><span className="tiny muted">Facture</span><div className="small">{invoice.invoice_number}</div></div>
                <div><span className="tiny muted">Date</span><div className="small">{fmtDate(invoice.invoice_date)}</div></div>
                <div><span className="tiny muted">Type</span><div className="small">{invoice.document_type}</div></div>
              </div>
              <div className="grid-3">
                <div><span className="tiny muted">HT</span><strong className="num">{fmtDT(invoice.amount_ht)}</strong></div>
                <div><span className="tiny muted">TVA</span><strong className="num">{fmtDT(invoice.vat_amount)}</strong></div>
                <div><span className="tiny muted">TTC</span><strong className="num">{fmtDT(invoice.amount_ttc)}</strong></div>
              </div>
              {(invoice.invoice_tax_lines || []).map((line, index) => <span key={`${line.tax_rate}-${index}`} className="tiny muted">TVA {Number(line.tax_rate || 0)} % · Base {fmtDT(line.taxable_base)} · Taxe {fmtDT(line.tax_amount)}</span>)}
            </div>
          )}
          <div className="card col" style={{ gap: 14 }}>
            <strong>Imputation approuvée par le comptable</strong>
            <div className="field"><label htmlFor="mapping-journal">Journal</label><select id="mapping-journal" className="input" value={selection.journalId} onChange={set('journalId')}><option value="">Choisir…</option>{compatibleJournals.map((journal) => <option key={journal.id} value={journal.id}>{journal.code} · {journal.name}</option>)}</select></div>
            <AccountSelect id="mapping-main" label={invoice?.kind === 'income' ? 'Compte de produit' : 'Compte de charge'} value={selection.targetAccountId} onChange={set('targetAccountId')} accounts={accounts} />
            <AccountSelect id="mapping-third-party" label={invoice?.kind === 'income' ? 'Compte client' : 'Compte fournisseur'} value={selection.counterpartyAccountId} onChange={set('counterpartyAccountId')} accounts={accounts} />
            {Number(invoice?.vat_amount || 0) > 0 && <AccountSelect id="mapping-vat" label="Compte de TVA" value={selection.vatAccountId} onChange={set('vatAccountId')} accounts={accounts} />}
          </div>
          <div className="card tint-gray col" style={{ gap: 10 }}>
            <strong>Aperçu avant comptabilisation</strong>
            {!preview && <span className="small muted">Choisis les comptes pour afficher l’écriture.</span>}
            {preview?.error && <div className="row" style={{ alignItems: 'flex-start' }}><AlertTriangle size={18} color="var(--amber-700)" /><span className="small" role="alert">{preview.error}</span></div>}
            {preview?.lines && <PreviewTable preview={preview} />}
          </div>
          {success && <div className="card tint-teal small" role="status">{success}</div>}
          {actionError && <div className="card tint-coral small" role="alert">{actionError}</div>}
          <button className="btn btn-primary btn-block" disabled={posting || !preview?.balanced} onClick={post}>{posting ? <><Loader2 size={17} className="spin" /> Comptabilisation…</> : 'Valider et comptabiliser'}</button>
        </>
      )}
    </div>
  );
}

function AccountSelect({ id, label, value, onChange, accounts }) {
  return <div className="field"><label htmlFor={id}>{label}</label><select id={id} className="input" value={value} onChange={onChange}><option value="">Choisir…</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.account_number} · {account.label}</option>)}</select></div>;
}

function PreviewTable({ preview }) {
  return <div className="col" style={{ gap: 8 }}><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}><thead><tr><th style={{ textAlign: 'start' }}>Compte</th><th style={{ textAlign: 'start' }}>Description</th><th style={{ textAlign: 'end' }}>Débit</th><th style={{ textAlign: 'end' }}>Crédit</th></tr></thead><tbody>{preview.lines.map((line, index) => <tr key={`${line.account.id}-${index}`}><td>{line.account.number} · {line.account.label}</td><td>{line.description}</td><td className="num" style={{ textAlign: 'end' }}>{line.debit ? fmtDT(line.debit) : '—'}</td><td className="num" style={{ textAlign: 'end' }}>{line.credit ? fmtDT(line.credit) : '—'}</td></tr>)}</tbody><tfoot><tr><th colSpan="2" style={{ textAlign: 'start' }}>TOTAL</th><th className="num" style={{ textAlign: 'end' }}>{fmtDT(preview.totalDebit)}</th><th className="num" style={{ textAlign: 'end' }}>{fmtDT(preview.totalCredit)}</th></tr></tfoot></table></div><StatusPill tone={preview.balanced ? 'success' : 'danger'}>{preview.balanced ? 'TOTAL DÉBIT = TOTAL CRÉDIT' : 'Écriture non équilibrée'}</StatusPill></div>;
}
