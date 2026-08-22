import { useMemo, useState } from 'react';
import { FileDown, FileSpreadsheet, Mail, Printer, ShieldCheck } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import { emailExport } from '../../lib/api.js';
import {
  accountingRows,
  buildDossier,
  downloadExport,
  filterTransactions,
  printDossier,
  toCsv,
  toExcelXml,
  toPrintableHtml,
} from '../../lib/accountant.js';

const today = () => new Date().toISOString().slice(0, 10);
const firstDayOfYear = () => `${new Date().getFullYear()}-01-01`;

export default function ExcelExport() {
  const { state, toast } = useStore();
  const { t, lang } = useT();
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('excel');
  const [email, setEmail] = useState('');
  const [from, setFrom] = useState(firstDayOfYear());
  const [to, setTo] = useState(today());
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  const transactions = useMemo(() => filterTransactions(state.transactions, { period, from, to }), [state.transactions, period, from, to]);
  const rows = useMemo(() => accountingRows(transactions, lang), [transactions, lang]);
  const dossier = useMemo(() => buildDossier(transactions, state.documents), [transactions, state.documents]);
  const hasInvalidRange = period === 'custom' && from && to && from > to;

  const generate = async () => {
    if (busy || hasInvalidRange) return;
    if (!rows.length) {
      toast(t('docs.noTransactions'), 'error');
      return;
    }
    try {
      setBusy(true);
      const suffix = period === 'custom' ? `${from || 'debut'}-${to || 'fin'}` : period;
      if (format === 'pdf') {
        printDossier(toPrintableHtml(rows, dossier, state.profile?.name || 'El Comptabli', lang));
        setDone(t('docs.pdfReady'));
      } else if (format === 'excel') {
        downloadExport(toExcelXml(rows, dossier, lang), 'application/vnd.ms-excel', `el-comptabli-dossier-${suffix}.xls`);
        setDone(t('docs.excelReady'));
      } else {
        downloadExport(`\ufeff${toCsv(rows)}`, 'text/csv;charset=utf-8;', `el-comptabli-dossier-${suffix}.csv`);
        setDone(t('docs.csvReady'));
      }
      if (email.trim()) {
        await emailExport(email.trim(), rows);
        setDone((message) => `${message} ${t('docs.emailSent', { email: email.trim() })}`);
      }
      toast(t('reports.exported'));
    } catch (error) {
      toast(error.message || t('docs.exportFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen stagger">
      <TopBar title={t('docs.accountantPack')} subtitle={t('docs.exportSub')} />

      <section className="card tint-teal" aria-label={t('docs.quickCheck')}>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="avatar" aria-hidden="true"><ShieldCheck size={21} /></div>
          <div className="grow">
            <h2 style={{ margin: 0, fontSize: 18 }}>{t('docs.quickCheck')}</h2>
            <p className="small muted" style={{ margin: '4px 0 0' }}>{t('docs.quickCheckHint')}</p>
          </div>
        </div>
        <div className="row between small" style={{ marginTop: 16 }}><span>{t('docs.transactionsCount', { count: dossier.transactionCount })}</span><strong className="num">{dossier.transactionCount}</strong></div>
        <div className="row between small" style={{ marginTop: 8 }}><span>{t('docs.toReview', { count: dossier.scansToReview })}</span><strong className="num">{dossier.scansToReview}</strong></div>
        <div className="row between small" style={{ marginTop: 8 }}><span>{t('docs.missingProofs', { count: dossier.missingProofs })}</span><strong className="num">{dossier.missingProofs}</strong></div>
      </section>

      <section aria-labelledby="period-title">
        <div className="section-head"><h2 id="period-title">{t('docs.period')}</h2></div>
        <FilterPills
          options={[{ id: 'month', label: t('docs.month') }, { id: 'quarter', label: t('docs.quarter') }, { id: 'year', label: t('docs.year') }, { id: 'custom', label: t('docs.custom') }]}
          value={period}
          onChange={setPeriod}
        />
        {period === 'custom' && (
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field"><label htmlFor="export-from">{t('docs.from')}</label><input id="export-from" className="input num" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
            <div className="field"><label htmlFor="export-to">{t('docs.to')}</label><input id="export-to" className="input num" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div>
          </div>
        )}
        {hasInvalidRange && <p className="small" role="alert" style={{ color: 'var(--pill-danger-fg)', margin: '8px 0 0' }}>{t('docs.invalidRange')}</p>}
      </section>

      <section aria-labelledby="format-title">
        <div className="section-head"><h2 id="format-title">{t('docs.chooseFormat')}</h2></div>
        <SegmentedControl options={[
          { id: 'excel', label: 'Excel' },
          { id: 'pdf', label: 'PDF' },
          { id: 'csv', label: 'CSV' },
        ]} value={format} onChange={setFormat} />
        <p className="tiny muted" style={{ margin: '8px 0 0' }}>{format === 'pdf' ? t('docs.pdfHint') : format === 'excel' ? t('docs.excelHint') : t('docs.csvHint')}</p>
      </section>

      <section className="field">
        <label htmlFor="accountant-email"><Mail size={15} aria-hidden="true" /> {t('docs.accountantEmail')}</label>
        <input id="accountant-email" className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="naji@cabinet.tn" />
        <span className="hint">{t('docs.emailHint')}</span>
      </section>

      <button className="btn btn-primary btn-block" disabled={busy || hasInvalidRange} onClick={generate}>
        {busy ? t('docs.exporting') : format === 'pdf' ? <><Printer size={17} /> {t('docs.generatePdf')}</> : format === 'excel' ? <><FileSpreadsheet size={17} /> {t('docs.generateExcel')}</> : <><FileDown size={17} /> {t('docs.generateCsv')}</>}
      </button>

      {done && <div className="card tint-teal" role="status"><span className="small">✓ {done}</span></div>}
      <p className="disclaimer">{t('docs.exportDisclaimer')}</p>
    </div>
  );
}
