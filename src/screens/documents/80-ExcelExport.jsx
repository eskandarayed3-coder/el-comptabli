import { useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { categoryLabel } from '../../lib/taxRules.js';
import TopBar from '../../components/TopBar.jsx';
import FilterPills from '../../components/FilterPills.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import { emailExport } from '../../lib/api.js';

function toCsv(rows) {
  const header = ['Date', 'Type', 'Libellé', 'Catégorie', 'HT', 'TVA', 'TTC'];
  const lines = rows.map((r) => [r.date, r.kind, r.label, r.category, r.amountHT, r.tva, r.amountTTC].join(';'));
  return [header.join(';'), ...lines].join('\n');
}

function xmlEscape(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toExcelXml(rows) {
  const header = ['Date', 'Type', 'Libellé', 'Catégorie', 'HT', 'TVA', 'TTC'];
  const body = rows.map((row) => [row.date, row.kind, row.label || row.vendor, row.category, row.amountHT, row.tva, row.amountTTC]);
  const xmlRows = [header, ...body].map((line) => `<Row>${line.map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`).join('')}</Row>`).join('');
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Transactions"><Table>${xmlRows}</Table></Worksheet></Workbook>`;
}

function download(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function printRows(rows) {
  const cells = (line) => line.map((cell) => `<td>${xmlEscape(cell)}</td>`).join('');
  const rowsHtml = rows.map((row) => `<tr>${cells([row.date, row.kind, row.label || row.vendor, row.category, row.amountHT, row.tva, row.amountTTC])}</tr>`).join('');
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) throw new Error('Autorise les fenêtres pop-up pour exporter en PDF.');
  popup.document.write(`<!doctype html><html lang="fr"><head><title>Export El Comptabli</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#10201e}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #cbd5d1;padding:7px;text-align:left}th{background:#e7f6f1}</style></head><body><h1>El Comptabli — Export</h1><table><thead><tr>${cells(['Date', 'Type', 'Libellé', 'Catégorie', 'HT', 'TVA', 'TTC'])}</tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
  popup.document.close();
}

export default function ExcelExport() {
  const { state, toast } = useStore();
  const { t, lang } = useT();
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('excel');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState({ tx: true });
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (k) => setContent((c) => ({ ...c, [k]: !c[k] }));

  const generate = async () => {
    if (!content.tx || busy) return;
    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    const quarter = Math.floor(now.getMonth() / 3);
    const rows = state.transactions.filter((tx) => {
      const date = new Date(`${tx.date}T00:00:00`);
      if (period === 'month') return tx.date?.startsWith(month);
      if (period === 'quarter') return date.getFullYear() === now.getFullYear() && Math.floor(date.getMonth() / 3) === quarter;
      if (period === 'year') return date.getFullYear() === now.getFullYear();
      return true;
    });
    if (!rows.length) { toast('Aucune transaction pour cette période.', 'error'); return; }
    try {
      setBusy(true);
      if (format === 'pdf') {
        printRows(rows);
        setDone('La fenêtre d’impression est ouverte. Choisis « Enregistrer au format PDF ».');
      } else if (format === 'excel') {
        download(toExcelXml(rows), 'application/vnd.ms-excel', `el-comptabli-export-${period}.xls`);
        setDone('Fichier Excel exporté.');
      } else {
        download('\ufeff' + toCsv(rows), 'text/csv;charset=utf-8;', `el-comptabli-export-${period}.csv`);
        setDone('Fichier CSV exporté.');
      }
      if (email.trim()) {
        await emailExport(email.trim(), rows);
        setDone((message) => `${message} Email envoyé à ${email.trim()}.`);
      }
      toast(t('reports.exported'));
    } catch (error) {
      toast(error.message || 'Export impossible.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const CONTENT_ITEMS = [
    { id: 'tx', label: 'Transactions' },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={`${t('docs.exportTitle')} 📤`} />
      <FilterPills
        options={[{ id: 'month', label: 'Mois' }, { id: 'quarter', label: 'Trimestre' }, { id: 'year', label: 'Année' }, { id: 'custom', label: 'Personnalisé' }]}
        value={period} onChange={setPeriod}
      />

      <div className="col" style={{ gap: 8 }}>
        {CONTENT_ITEMS.map((c) => (
          <button key={c.id} className="card row between" style={{ width: '100%' }} onClick={() => toggle(c.id)}>
            <span className="small" style={{ fontWeight: 600 }}>{c.label}</span>
            <span style={{ color: content[c.id] ? 'var(--teal-700)' : 'var(--hairline)' }}>{content[c.id] ? '✓' : '○'}</span>
          </button>
        ))}
      </div>

      <SegmentedControl options={[{ id: 'excel', label: 'Excel' }, { id: 'pdf', label: 'PDF' }, { id: 'csv', label: 'CSV' }]} value={format} onChange={setFormat} />

      <div className="field">
        <label>Email de ton comptable (optionnel)</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="naji@cabinet.tn" />
      </div>

      <button className="btn btn-primary btn-block" disabled={busy || !content.tx} onClick={generate}>{busy ? 'Export en cours…' : 'Générer l’export'}</button>

      {done && (
        <div className="card tint-teal">
          <span className="small">✓ {done}</span>
        </div>
      )}
    </div>
  );
}
