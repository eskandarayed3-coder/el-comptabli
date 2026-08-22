import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { scanDocument } from '../../lib/api.js';
import { CATEGORIES } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';

export default function OcrReview() {
  const navigate = useNavigate();
  const { add, logActivity, toast } = useStore();
  const { t, lang } = useT();
  const id = useId();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fields, setFields] = useState({
    vendor: '', reference: '', date: new Date().toISOString().slice(0, 10),
    amountHT: '', tva: '', amountTTC: '', category: 'autres', kind: 'expense',
  });

  useEffect(() => {
    const file = window.__pendingScanFile;
    if (!file) { navigate('/scanner'); return; }
    const previewUrl = URL.createObjectURL(file);
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
        }));
      })
      .catch((e) => { if (active) setError(e.friendly?.code ? t(`aiOff.codes.${e.friendly.code}`) : t('aiOff.codes.upstream_error')); })
      .finally(() => { if (active) setBusy(false); });
    return () => {
      active = false;
      URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const canSave = fields.vendor.trim() && fields.amountTTC !== '' && Number.isFinite(Number(fields.amountTTC));

  const save = () => {
    if (!canSave) return;
    add('transactions', {
      kind: fields.kind,
      vendor: fields.vendor,
      label: fields.vendor,
      category: fields.category,
      date: fields.date,
      amountHT: Number(fields.amountHT) || 0,
      tva: Number(fields.tva) || 0,
      amountTTC: Number(fields.amountTTC) || 0,
      scanned: true,
    });
    add('documents', { name: `${fields.vendor || 'Document'}.jpg`, type: 'facture', date: fields.date, size: 'N/D', scanned: true });
    logActivity({ fr: `Facture ${fields.vendor} scannée`, ar: `فاتورة ${fields.vendor} تسكانات` }.fr, 'ScanLine');
    toast(t('common.saved'));
    navigate('/scanner');
  };

  if (busy) {
    return (
      <div className="screen no-nav center" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        {preview && <img src={preview} alt="" style={{ maxWidth: 200, borderRadius: 16, opacity: 0.6 }} />}
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

      <button type="button" className="btn btn-primary btn-block" disabled={!canSave} onClick={save}>{t('scanner.saveAs')} {t(`common.${fields.kind}`)}</button>
    </div>
  );
}
