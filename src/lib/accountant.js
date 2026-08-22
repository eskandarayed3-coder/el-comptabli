export const EXPORT_HEADERS = ['Date', 'Type', 'Libellé', 'Catégorie', 'Référence', 'HT', 'TVA', 'TTC', 'Justificatif'];

const FORMULA_PREFIX = /^[=+@-]/;

export function asAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 1000) / 1000 : 0;
}

// Prevent spreadsheet formula injection when a supplier, label or reference
// starts with a character Excel treats as a formula.
export function safeSpreadsheetText(value) {
  const text = String(value ?? '').replace(/[\u0000-\u001f]/g, ' ').trim();
  return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

function csvCell(value) {
  const text = safeSpreadsheetText(value);
  return /[;\n\r"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function accountingRows(transactions = [], lang = 'fr') {
  const labels = lang === 'ar'
    ? { income: 'مداخيل', expense: 'مصاريف', scanned: 'ممسوح بالذكاء', missing: 'لازم وصل' }
    : { income: 'Recette', expense: 'Dépense', scanned: 'Scanné IA', missing: 'Justificatif à joindre' };

  return [...transactions]
    .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
    .map((transaction) => ({
      date: String(transaction.date || ''),
      type: transaction.kind === 'income' ? labels.income : labels.expense,
      label: safeSpreadsheetText(transaction.label || transaction.vendor || ''),
      category: safeSpreadsheetText(transaction.category || ''),
      reference: safeSpreadsheetText(transaction.reference || transaction.invoice?.number || ''),
      amountHT: asAmount(transaction.amountHT),
      tva: asAmount(transaction.tva),
      amountTTC: asAmount(transaction.amountTTC ?? transaction.amount),
      proof: transaction.scanned ? labels.scanned : labels.missing,
    }));
}

export function buildDossier(transactions = [], documents = []) {
  const income = transactions.filter((transaction) => transaction.kind === 'income');
  const expenses = transactions.filter((transaction) => transaction.kind === 'expense');
  const documentTransactionIds = new Set(documents.map((document) => document.transactionId).filter(Boolean));
  const hasGeneratedInvoice = (transaction) => transaction.invoice?.number
    && documents.some((document) => String(document.name || '').includes(transaction.invoice.number));
  const missingProofs = transactions.filter((transaction) => !transaction.scanned
    && !documentTransactionIds.has(transaction.id)
    && !hasGeneratedInvoice(transaction));
  const scansToReview = documents.filter((document) => document.scanned && !document.reviewed);

  const sum = (items, key) => items.reduce((total, item) => total + asAmount(item[key]), 0);
  return {
    transactionCount: transactions.length,
    documentCount: documents.length,
    scannedCount: documents.filter((document) => document.scanned).length,
    scansToReview: scansToReview.length,
    missingProofs: missingProofs.length,
    incomeHT: sum(income, 'amountHT'),
    expenseHT: sum(expenses, 'amountHT'),
    vatCollected: sum(income, 'tva'),
    vatDeductible: sum(expenses, 'tva'),
  };
}

export function filterTransactions(transactions = [], { period = 'month', from = '', to = '', now = new Date() } = {}) {
  const year = now.getFullYear();
  const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const quarter = Math.floor(now.getMonth() / 3);
  return transactions.filter((transaction) => {
    const date = String(transaction.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    if (period === 'month') return date.startsWith(month);
    if (period === 'quarter') {
      const current = new Date(`${date}T00:00:00`);
      return current.getFullYear() === year && Math.floor(current.getMonth() / 3) === quarter;
    }
    if (period === 'year') return date.startsWith(`${year}-`);
    return (!from || date >= from) && (!to || date <= to);
  });
}

export function toCsv(rows) {
  const body = rows.map((row) => [
    row.date, row.type, row.label, row.category, row.reference,
    row.amountHT, row.tva, row.amountTTC, row.proof,
  ]);
  return [EXPORT_HEADERS, ...body]
    .map((line) => line.map(csvCell).join(';'))
    .join('\n');
}

function xmlCell(value, type = 'String') {
  const content = type === 'Number' ? asAmount(value) : safeSpreadsheetText(value);
  return `<Cell><Data ss:Type="${type}">${xmlEscape(content)}</Data></Cell>`;
}

function worksheet(name, rows, numberColumns = new Set()) {
  const rendered = rows.map((line, lineIndex) => `<Row>${line.map((cell, index) => (
    xmlCell(cell, lineIndex > 0 && numberColumns.has(index) ? 'Number' : 'String')
  )).join('')}</Row>`).join('');
  return `<Worksheet ss:Name="${xmlEscape(name)}"><Table>${rendered}</Table></Worksheet>`;
}

export function toExcelXml(rows, dossier, lang = 'fr') {
  const summary = lang === 'ar'
    ? [['مؤشر', 'القيمة'], ['عدد العمليات', dossier.transactionCount], ['عدد الوثائق', dossier.documentCount], ['وثائق ممسوحة', dossier.scannedCount], ['عمليات بدون وصل', dossier.missingProofs], ['مداخيل HT', dossier.incomeHT], ['مصاريف HT', dossier.expenseHT], ['TVA محصّلة', dossier.vatCollected], ['TVA قابلة للخصم', dossier.vatDeductible]]
    : [['Indicateur', 'Valeur'], ['Nombre d’opérations', dossier.transactionCount], ['Nombre de documents', dossier.documentCount], ['Documents scannés', dossier.scannedCount], ['Opérations sans justificatif', dossier.missingProofs], ['Recettes HT', dossier.incomeHT], ['Dépenses HT', dossier.expenseHT], ['TVA collectée', dossier.vatCollected], ['TVA déductible', dossier.vatDeductible]];
  const table = rows.map((row) => [
    row.date, row.type, row.label, row.category, row.reference,
    row.amountHT, row.tva, row.amountTTC, row.proof,
  ]);
  return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="header"><Font ss:Bold="1"/><Interior ss:Color="#E6F5F3" ss:Pattern="Solid"/></Style></Styles>${worksheet('Transactions', [EXPORT_HEADERS, ...table], new Set([5, 6, 7]))}${worksheet('Contrôle', summary, new Set([1]))}</Workbook>`;
}

export function toPrintableHtml(rows, dossier, companyName = 'El Comptabli', lang = 'fr') {
  const summaryRows = lang === 'ar'
    ? [['العمليات', dossier.transactionCount], ['الوثائق', dossier.documentCount], ['وثائق للمراجعة', dossier.scansToReview], ['عمليات بلا وصل', dossier.missingProofs], ['TVA محصّلة', dossier.vatCollected.toFixed(3)], ['TVA قابلة للخصم', dossier.vatDeductible.toFixed(3)]]
    : [['Opérations', dossier.transactionCount], ['Documents', dossier.documentCount], ['Documents à vérifier', dossier.scansToReview], ['Opérations sans justificatif', dossier.missingProofs], ['TVA collectée', dossier.vatCollected.toFixed(3)], ['TVA déductible', dossier.vatDeductible.toFixed(3)]];
  const cells = (line, cell = 'td') => line.map((item) => `<${cell}>${xmlEscape(safeSpreadsheetText(item))}</${cell}>`).join('');
  const tableRows = rows.map((row) => `<tr>${cells([row.date, row.type, row.label, row.category, row.reference, row.amountHT.toFixed(3), row.tva.toFixed(3), row.amountTTC.toFixed(3), row.proof])}</tr>`).join('');
  const controls = summaryRows.map((row) => `<tr>${cells(row)}</tr>`).join('');
  const heading = lang === 'ar' ? 'ملف المحاسب' : 'Dossier comptable';
  const detail = lang === 'ar' ? 'حزمة تحضير. ثبّت المعطيات قبل التصريح الرسمي.' : 'Dossier de préparation. Vérifie les données avant toute déclaration officielle.';
  return `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${xmlEscape(heading)}</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#10201e;font-size:12px}header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:24px}h1{margin:0;color:#0f5c56;font-size:26px}p{color:#52615f;margin:6px 0}section{margin:22px 0}h2{font-size:15px;margin:0 0 9px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5d1;padding:7px;text-align:start;vertical-align:top}th{background:#e7f6f1;font-weight:700}.summary{max-width:420px}.summary td:first-child{background:#f5f7f7;font-weight:600}@page{margin:14mm}</style></head><body><header><div><h1>${xmlEscape(heading)}</h1><p>${xmlEscape(companyName || 'El Comptabli')}</p></div><p>${new Date().toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-TN')}</p></header><section><h2>${lang === 'ar' ? 'مراجعة سريعة' : 'Contrôle rapide'}</h2><table class="summary"><tbody>${controls}</tbody></table></section><section><h2>${lang === 'ar' ? 'العمليات' : 'Opérations'}</h2><table><thead><tr>${cells(EXPORT_HEADERS, 'th')}</tr></thead><tbody>${tableRows}</tbody></table></section><p>${xmlEscape(detail)}</p></body></html>`;
}

export function downloadExport(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function printDossier(html) {
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) throw new Error('Autorise les fenêtres pop-up pour enregistrer le PDF.');
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 200);
}
