import { useEffect, useState } from 'react';
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
    setPreview(URL.createObjectURL(file));
    scanDocument(file)
      .then((f) => {
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
      .catch((e) => setError(e.friendly?.code ? t(`aiOff.codes.${e.friendly.code}`) : t('aiOff.codes.upstream_error')))
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
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
          <ZoomIn size={16} color="var(--text-2)" />
        </div>
      )}

      {error && (
        <div className="card tint-amber">
          <p className="small" style={{ fontWeight: 600 }}>{error}</p>
          <p className="tiny muted">{t('scanner.confidence')}</p>
        </div>
      )}

      <div className="grid-2">
        <div className="field">
          <label>{t('scanner.vendor')}</label>
          <input className="input" value={fields.vendor} onChange={set('vendor')} />
        </div>
        <div className="field">
          <label>{t('scanner.reference')}</label>
          <input className="input" value={fields.reference} onChange={set('reference')} />
        </div>
        <div className="field">
          <label>{t('common.date')}</label>
          <input className="input" type="date" value={fields.date} onChange={set('date')} />
        </div>
        <div className="field">
          <label>{t('common.category')}</label>
          <select className="input" value={fields.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c[lang === 'ar' ? 'ar' : 'fr']}</option>)}
          </select>
        </div>
        <div className="field">
          <label>{t('common.ht')}</label>
          <input className="input num" type="number" value={fields.amountHT} onChange={set('amountHT')} />
        </div>
        <div className="field">
          <label>{t('common.tva')}</label>
          <input className="input num" type="number" value={fields.tva} onChange={set('tva')} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>{t('common.ttc')}</label>
          <input className="input num" type="number" value={fields.amountTTC} onChange={set('amountTTC')} />
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={save}>{t('scanner.saveAs')} {t(`common.${fields.kind}`)}</button>
    </div>
  );
}
