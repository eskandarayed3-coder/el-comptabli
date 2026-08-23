import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ZoomIn } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { confirmScannedInvoice, scanDocument, uploadDocument } from '../../lib/api.js';
import { CATEGORIES, TVA_RATES } from '../../lib/taxRules.js';
import { uid } from '../../lib/format.js';
import { invoiceConsistency, parseTunisianAmount, validateConfirmedInvoice } from '../../../shared/invoice.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

const INVOICE_DRAFT_KEY = 'elcomptabli:invoice-from-scan';

function closestTvaRate(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return 19;
  return TVA_RATES.concat(0).reduce((closest, candidate) => (
    Math.abs(candidate - rate) < Math.abs(closest - rate) ? candidate : closest
  ), 19);
}

export default function OcrReview() {
  const navigate = useNavigate();
  const { add, logActivity, replaceCloudState, toast } = useStore();
  const { t, lang } = useT();
  const id = useId();
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [destination, setDestination] = useState('expense');
  const [rawOcr, setRawOcr] = useState(null);
  const [confidence, setConfidence] = useState({});
  const [acceptInconsistency, setAcceptInconsistency] = useState(false);
  const [fields, setFields] = useState({
    vendor: '', supplierTaxId: '', invoiceNumber: '', date: new Date().toISOString().slice(0, 10),
    amountHT: '', tva: '', amountTTC: '', category: 'autres', kind: 'expense', tvaRate: '', documentType: 'facture',
  });

  useEffect(() => {
    const file = window.__pendingScanFile;
    if (!file) { navigate('/scanner'); return; }
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    let active = true;
    setPreview(previewUrl);
    scanDocument(file)
      .then(({ fields: f, raw }) => {
        if (!active) return;
        setRawOcr(raw || null);
        setConfidence(f.confidence || {});
        setFields((prev) => ({
          ...prev,
          vendor: f.vendor || '',
          supplierTaxId: f.supplierTaxId || '',
          invoiceNumber: f.invoiceNumber || f.reference || '',
          date: f.date || prev.date,
          amountHT: f.amountHT ?? '',
          tva: f.tva ?? '',
          amountTTC: f.amountTTC ?? '',
          category: f.category || 'autres',
          kind: f.kind || 'expense',
          tvaRate: f.tvaRate ?? '',
          documentType: f.documentType || 'facture',
        }));
        setDestination(f.kind === 'income' ? 'income' : 'expense');
      })
      .catch((e) => { if (active) setError(e.friendly?.message || e.message || t('aiOff.codes.upstream_error')); })
      .finally(() => { if (active) setBusy(false); });
    return () => {
      active = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => {
    setAcceptInconsistency(false);
    setFields((f) => ({ ...f, [k]: e.target.value }));
  };

  const kind = destination === 'income' ? 'income' : 'expense';
  const validation = validateConfirmedInvoice({ ...fields, kind, confidence });
  const consistency = invoiceConsistency(fields);
  const canSave = validation.ok && (consistency.consistent || acceptInconsistency);
  const lowConfidence = (field) => confidence[field] !== null && confidence[field] !== undefined && confidence[field] < 0.65;
  const inputStyle = (field) => lowConfidence(field) ? { borderColor: 'var(--amber-500, #c47b10)', background: 'var(--amber-50, #fff8e8)' } : undefined;

  const save = async () => {
    if (!canSave) return;
    const selectedFile = window.__pendingScanFile;
    const transactionId = uid();
    const documentId = uid();
    const amountHTValue = parseTunisianAmount(fields.amountHT) || 0;
    const vatValue = parseTunisianAmount(fields.tva) || 0;
    const amountTTCValue = parseTunisianAmount(fields.amountTTC) || 0;
    const document = {
      id: documentId,
      name: selectedFile?.name || `${fields.vendor || 'Document'}.pdf`,
      type: 'facture',
      date: fields.date,
      size: selectedFile ? `${Math.max(1, Math.round(selectedFile.size / 1024))} Ko` : 'N/D',
      scanned: true,
      reviewed: true,
      vendor: fields.vendor.trim(),
      reference: fields.invoiceNumber.trim(),
      amountTTC: amountTTCValue,
      documentType: fields.documentType,
      source: 'ai-scan',
      status: 'verified',
    };

    if (!selectedFile) return;
    setSaving(true);
    setError(null);
    if (destination === 'invoice') {
      let archived;
      try {
        archived = await uploadDocument(selectedFile, documentId);
      } catch (e) {
        setError(e.friendly?.message || e.message || t('docs.uploadFailed'));
        setSaving(false);
        return;
      }
      const archivedDocument = { ...document, ...archived.document, size: document.size };
      const amountHT = amountHTValue || Math.max(0, amountTTCValue - vatValue);
      const inferredRate = parseTunisianAmount(fields.tvaRate) || (amountHT > 0 ? vatValue * 100 / amountHT : 19);
      sessionStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify({
        client: fields.vendor.trim(),
        date: fields.date,
        reference: fields.invoiceNumber.trim(),
        amountHT,
        tva: vatValue,
        amountTTC: amountTTCValue,
        tvaRate: closestTvaRate(inferredRate),
      }));
      add('documents', { ...archivedDocument, convertedToInvoice: true });
      logActivity(`Document ${fields.vendor} converti en brouillon de facture`, 'FileText');
      delete window.__pendingScanFile;
      setSaving(false);
      toast(t('scanner.invoiceDraftReady'));
      navigate('/income/invoice?source=scan');
      return;
    }

    try {
      const result = await confirmScannedInvoice({
        file: selectedFile,
        documentId,
        transactionId,
        fields: { ...fields, kind, confidence },
        rawOcr,
        acceptInconsistency,
      });
      if (!result.state) throw new Error('La synchronisation du tableau de bord a échoué.');
      replaceCloudState(result.state);
      delete window.__pendingScanFile;
      toast(t('common.saved'));
      navigate('/documents');
    } catch (e) {
      setError(e.friendly?.message || e.message || t('docs.uploadFailed'));
      setSaving(false);
    }
  };

  if (busy) {
    return (
      <div className="screen no-nav center" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {preview ? <img src={preview} alt="" style={{ maxWidth: 200, borderRadius: 16, opacity: 0.6 }} /> : <FileText size={42} color="var(--teal-700)" aria-hidden="true" />}
        <div className="typing"><i /><i /><i /></div>
        <p className="muted">{t('scanner.analyzing')}</p>
        <p className="tiny muted">{t('scanner.analyzingSub')}</p>
      </div>
    );
  }

  return (
    <div className="screen stagger">
      <TopBar title={t('scanner.reviewTitle')} subtitle={t('scanner.reviewSub')} />

      {preview && (
        <div className="row" style={{ gap: 10 }}>
          <img src={preview} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12 }} />
          <ZoomIn size={16} color="var(--text-2)" aria-hidden="true" />
        </div>
      )}
      {!preview && <div className="row" style={{ gap: 10 }}><FileText size={28} color="var(--teal-700)" aria-hidden="true" /><span className="small muted">{t('scanner.pdfSelected')}</span></div>}

      {error && (
        <div className="card tint-amber" role="alert">
          <p className="small" style={{ fontWeight: 600 }}>{error}</p>
          <p className="tiny muted">{t('scanner.confidence')}</p>
        </div>
      )}

      <div className="grid-2">
        <div className="field">
          <label htmlFor={`${id}-vendor`}>{t('scanner.vendor')}</label>
          <input id={`${id}-vendor`} className="input" style={inputStyle('vendor')} autoComplete="organization" value={fields.vendor} onChange={set('vendor')} />
          {lowConfidence('vendor') && <span className="tiny" style={{ color: 'var(--amber-700, #89520a)' }}>{t('scanner.verifyField')}</span>}
          {validation.errors.vendor && <span className="tiny" style={{ color: 'var(--danger, #c62828)' }}>{t('scanner.requiredField')}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-invoice-number`}>{t('scanner.invoiceNumber')}</label>
          <input id={`${id}-invoice-number`} className="input" style={inputStyle('invoiceNumber')} value={fields.invoiceNumber} onChange={set('invoiceNumber')} />
          {lowConfidence('invoiceNumber') && <span className="tiny" style={{ color: 'var(--amber-700, #89520a)' }}>{t('scanner.verifyField')}</span>}
          {validation.errors.invoiceNumber && <span className="tiny" style={{ color: 'var(--danger, #c62828)' }}>{t('scanner.requiredField')}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-tax-id`}>{t('scanner.supplierTaxId')}</label>
          <input id={`${id}-tax-id`} className="input" style={inputStyle('supplierTaxId')} value={fields.supplierTaxId} onChange={set('supplierTaxId')} placeholder="1234567/A/M/000" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-date`}>{t('common.date')}</label>
          <input id={`${id}-date`} className="input" style={inputStyle('date')} type="date" value={fields.date} onChange={set('date')} />
          {validation.errors.date && <span className="tiny" style={{ color: 'var(--danger, #c62828)' }}>{t('scanner.invalidDate')}</span>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-category`}>{t('common.category')}</label>
          <select id={`${id}-category`} className="input" value={fields.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang === 'ar' ? 'ar' : 'fr']}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-ht`}>{t('common.ht')}</label>
          <input id={`${id}-ht`} className="input num" style={inputStyle('amountHT')} inputMode="decimal" value={fields.amountHT} onChange={set('amountHT')} placeholder="0,000" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-tva`}>{t('common.tva')}</label>
          <input id={`${id}-tva`} className="input num" style={inputStyle('tva')} inputMode="decimal" value={fields.tva} onChange={set('tva')} placeholder="0,000" />
        </div>
        <div className="field">
          <label htmlFor={`${id}-tva-rate`}>{t('scanner.vatRate')}</label>
          <input id={`${id}-tva-rate`} className="input num" style={inputStyle('tvaRate')} inputMode="decimal" value={fields.tvaRate} onChange={set('tvaRate')} placeholder="19" />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${id}-ttc`}>{t('common.ttc')}</label>
          <input id={`${id}-ttc`} className="input num" style={inputStyle('amountTTC')} inputMode="decimal" value={fields.amountTTC} onChange={set('amountTTC')} placeholder="0,000" />
          {validation.errors.amountTTC && <span className="tiny" style={{ color: 'var(--danger, #c62828)' }}>{t('scanner.invalidAmount')}</span>}
        </div>
      </div>

      {!consistency.consistent && (
        <div className="card tint-amber" role="alert">
          <p className="small" style={{ fontWeight: 700, margin: 0 }}>{t('scanner.inconsistentTotal', { amount: consistency.difference.toFixed(3) })}</p>
          <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={() => setAcceptInconsistency(true)} disabled={acceptInconsistency}>
            {acceptInconsistency ? t('scanner.differenceConfirmed') : t('scanner.confirmDifference')}
          </button>
        </div>
      )}

      <section className="card tint-indigo" aria-labelledby={`${id}-destination`}>
        <h2 id={`${id}-destination`} style={{ margin: '0 0 6px', fontSize: 17 }}>{t('scanner.destination')}</h2>
        <p className="small muted" style={{ margin: '0 0 12px' }}>{t('scanner.destinationHint')}</p>
        <SegmentedControl
          value={destination}
          onChange={setDestination}
          options={[
            { id: 'expense', label: t('common.expense') },
            { id: 'income', label: t('common.income') },
            { id: 'invoice', label: t('invoice.label') },
          ]}
        />
      </section>

      <button type="button" className="btn btn-primary btn-block" disabled={!canSave || saving} onClick={save}>
        {saving ? t('common.loading') : destination === 'invoice' ? t('scanner.toInvoice') : `${t('scanner.saveAs')} ${t(`common.${destination}`)}`}
      </button>
    </div>
  );
}
