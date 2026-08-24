import { useState } from 'react';
import { FileSpreadsheet, FileText, Sparkles } from 'lucide-react';
import { useStore, monthTotals } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { generateInsight } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';
import SuggestionChips from '../../components/SuggestionChips.jsx';
import TintCard from '../../components/TintCard.jsx';
import MarkdownLite from '../../components/MarkdownLite.jsx';

export default function AiReports() {
  const { state, add, toast } = useStore();
  const { t, lang } = useT();
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async (text) => {
    const p = text ?? prompt;
    if (!p.trim() || busy) return;
    setBusy(true);
    try {
      const ym = new Date().toISOString().slice(0, 7);
      const result = await generateInsight({
        prompt: p,
        data: { transactions: state.transactions, totals: monthTotals(state.transactions, ym, state.generalLedger) },
        profile: state.profile,
      });
      add('aiReports', { title: p.slice(0, 50), body: result, at: new Date().toISOString() });
      setPrompt('');
      toast(t('common.saved'));
    } catch (e) {
      toast(e.friendly?.code ? t(`aiOff.codes.${e.friendly.code}`) : t('aiOff.codes.upstream_error'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reports = state.aiReports || [];

  return (
    <div className="screen stagger">
      <div className="top-bar">
        <h1 className="grow">{t('chat.reportsTitle')}</h1>
        <span className="pill premium">Premium</span>
      </div>

      <div className="card">
        <textarea className="input" rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('chat.reportsPrompt')} />
        <div style={{ height: 10 }} />
        <SuggestionChips items={t('chat.reportsChips')} onPick={(q) => generate(q)} />
        <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={busy || !prompt.trim()} onClick={() => generate()}>
          <Sparkles size={16} /> {busy ? t('chat.generating') : t('common.continue')}
        </button>
      </div>

      <div className="col" style={{ gap: 10 }}>
        {reports.map((r) => (
          <TintCard key={r.id} tone="indigo">
            <div className="col" style={{ gap: 6 }}>
              <span style={{ fontWeight: 700 }}>{r.title}</span>
              <span className="tiny muted">{fmtDate(r.at, lang)}</span>
              <MarkdownLite text={r.body} />
              <div className="row" style={{ gap: 8 }}>
                <span className="pill teal"><FileSpreadsheet size={12} /> Excel</span>
                <span className="pill white"><FileText size={12} /> PDF</span>
              </div>
            </div>
          </TintCard>
        ))}
      </div>
    </div>
  );
}
