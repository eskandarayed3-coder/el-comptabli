import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ZoomIn } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { scanDocument, uploadDocument } from '../../lib/api.js';
import { CATEGORIES, TVA_RATES } from '../../lib/taxRules.js';
import { uid } from '../../lib/format.js';
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
  const { add, logActivity, toast } = useStore();
  const { t, lang } = useT();
  const id = useId();
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [destination, setDestination] = useState('expense');
  const [fields, setFields] = useState({
    vendor: '', reference: '', date: new Date().toISOString().slice(0, 10),
    amountHT: '', tva: '', amountTTC: '', category: 'autres', kind: 'expense', tvaRate: '', documentType: 'facture',
  });

  useEffect(() => {
    const file = window.__pendingScanFile;
    if (!file) { navigate('/scanner'); return; }
    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    let active = true;
    setPreview(previewUrl);
    scanDocument(file)
      .then((f) => {
        if (!active) return;
        setFields((prev) => ({
          ...prev,
          vendor: f.vendor || '',
          reference: f.reference || '',
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
      .catch((e) => { if (active) setError(e.friendly?.code ? t(`aiOff.codes.${e.friendly.code}`) : t('aiOff.codes.upstream_error')); })
      .finally(() => { if (active) setBusy(false); });
    return () => {
      active = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const canSave = fields.vendor.trim() && fields.amountTTC !== '' && Number.isFinite(Number(fields.amountTTC));

  const save = async () => {
    if (!canSave) return;
    const selectedFile = window.__pendingScanFile;
    const transactionId = uid();
    const documentId = uid();
    const document = {
      id: documentId,
      name: selectedFile?.name || `${fields.vendor || 'Document'}.pdf`,
      type: 'facture',
      date: fields.date,
      size: selectedFile ? `${Math.max(1, Math.round(selectedFile.size / 1024))} Ko` : 'N/D',
      scanned: true,
      reviewed: true,
      vendor: fields.vendor.trim(),
      reference: fields.reference.trim(),
      amountTTC: Number(fields.amountTTC) || 0,
      documentType: fields.documentType,
      source: 'ai-scan',
      status: 'verified',
    };

    if (!selectedFile) return;
    setSaving(true);
    setError(null);
    let archived;
    try {
      archived = await uploadDocument(selectedFile, documentId);
    } catch (e) {
      setError(e.friendly?.message || t('docs.uploadFailed'));
      setSaving(false);
      return;
    }
    const archivedDocument = { ...document, ...archived.document, size: document.size };

    if (destination === 'invoice') {
      const amountHT = Number(fields.amountHT) || Math.max(0, (Number(fields.amountTTC) || 0) - (Number(fields.tva) || 0));
      const inferredRate = Number(fields.tvaRate) || (amountHT > 0 ? (Number(fields.tva) || 0) * 100 / amountHT : 19);
      sessionStorage.setItem(INVOICE_DRAFT_KEY, JSON.stringify({
        client: fields.vendor.trim(),
        date: fields.date,
        reference: fields.reference.trim(),
        amountHT,
        tva: Number(fields.tva) || 0,
        amountTTC: Number(fields.amountTTC) || 0,
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

    add('transactions', {
      id: transactionId,
      kind: destination,
      vendor: fields.vendor,
      label: fields.vendor,
      category: fields.category,
      reference: fields.reference.trim(),
      date: fields.date,
      amountHT: Number(fields.amountHT) || 0,
      tva: Number(fields.tva) || 0,
      amountTTC: Number(fields.amountTTC) || 0,
      scanned: true,
    });
    add('documents', { ...archivedDocument, transactionId });
    logActivity({ fr: `Facture ${fields.vendor} scannée`, ar: `فاتورة ${fields.vendor} تسكانات` }.fr, 'ScanLine');
    delete window.__pendingScanFile;
    setSaving(false);
    toast(t('common.saved'));
    navigate('/documents');
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
          <input id={`${id}-vendor`} className="input" autoComplete="organization" value={fields.vendor} onChange={set('vendor')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-reference`}>{t('scanner.reference')}</label>
          <input id={`${id}-reference`} className="input" value={fields.reference} onChange={set('reference')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-date`}>{t('common.date')}</label>
          <input id={`${id}-date`} className="input" type="date" value={fields.date} onChange={set('date')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-category`}>{t('common.category')}</label>
          <select id={`${id}-category`} className="input" value={fields.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang === 'ar' ? 'ar' : 'fr']}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-ht`}>{t('common.ht')}</label>
          <input id={`${id}-ht`} className="input num" type="number" inputMode="decimal" step="0.001" value={fields.amountHT} onChange={set('amountHT')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-tva`}>{t('common.tva')}</label>
          <input id={`${id}-tva`} className="input num" type="number" inputMode="decimal" step="0.001" value={fields.tva} onChange={set('tva')} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${id}-ttc`}>{t('common.ttc')}</label>
          <input id={`${id}-ttc`} className="input num" type="number" inputMode="decimal" step="0.001" value={fields.amountTTC} onChange={set('amountTTC')} />
        </div>
      </div>

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
