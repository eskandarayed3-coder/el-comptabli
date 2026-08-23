const CATEGORIES = new Set(['loyer', 'achats', 'carburant', 'electricite', 'telecom', 'salaires', 'impots', 'ventes', 'autres']);
const KINDS = new Set(['expense', 'income']);
const CONFIDENCE_FIELDS = ['vendor', 'supplierTaxId', 'invoiceNumber', 'date', 'amountHT', 'tva', 'amountTTC', 'tvaRate'];

function text(value, max = 180) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function parseTunisianAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  let raw = text(value, 80)
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/٫/g, ',')
    .replace(/٬/g, '')
    .replace(/[\u00a0\u202f\s]/g, '')
    .replace(/(?:TND|DT|DINARS?|د\.?ت)/giu, '')
    .replace(/[^0-9,.'-]/g, '');
  if (!raw || raw.startsWith('-')) return null;
  raw = raw.replace(/'/g, '');
  const comma = raw.lastIndexOf(',');
  const dot = raw.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) {
    const decimal = comma > dot ? ',' : '.';
    raw = raw.replace(decimal === ',' ? /\./g : /,/g, '').replace(decimal, '.');
  } else if (comma >= 0) {
    const parts = raw.split(',');
    raw = parts.length === 2 && parts[1].length <= 3 ? `${parts[0]}.${parts[1]}` : parts.join('');
  } else if ((raw.match(/\./g) || []).length > 1) {
    const parts = raw.split('.');
    const decimals = parts.pop();
    raw = decimals.length <= 3 ? `${parts.join('')}.${decimals}` : `${parts.join('')}${decimals}`;
  }
  const amount = Number(raw);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 1000) / 1000 : null;
}

export function normalizeInvoiceDate(value) {
  const raw = text(value, 40);
  const match = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/) || raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (!match) return null;
  const [year, month, day] = match[1].length === 4 ? [match[1], match[2], match[3]] : [match[3], match[2], match[1]];
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== iso ? null : iso;
}

export function normalizeTunisianTaxId(value) {
  return text(value, 40).toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9/]/g, '');
}

function confidenceMap(input) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return Object.fromEntries(CONFIDENCE_FIELDS.map((field) => {
    const value = Number(source[field]);
    return [field, Number.isFinite(value) ? Math.min(1, Math.max(0, value > 1 ? value / 100 : value)) : null];
  }));
}

export function normalizeOcrExtraction(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('OCR response must be an object');
  const vendor = text(input.vendor ?? input.supplier ?? input.fournisseur, 180);
  const invoiceNumber = text(input.invoiceNumber ?? input.reference ?? input.numeroFacture, 100);
  const vatRates = Array.isArray(input.vatRates)
    ? input.vatRates.map(parseTunisianAmount).filter((value) => value !== null && value <= 100).slice(0, 8)
    : [];
  const tvaRate = parseTunisianAmount(input.tvaRate);
  if (tvaRate !== null && tvaRate <= 100 && !vatRates.includes(tvaRate)) vatRates.unshift(tvaRate);
  return {
    vendor,
    supplierTaxId: normalizeTunisianTaxId(input.supplierTaxId ?? input.taxId ?? input.matriculeFiscal),
    invoiceNumber,
    reference: invoiceNumber,
    date: normalizeInvoiceDate(input.date) || '',
    amountHT: parseTunisianAmount(input.amountHT),
    tva: parseTunisianAmount(input.tva),
    amountTTC: parseTunisianAmount(input.amountTTC),
    tvaRate: tvaRate !== null && tvaRate <= 100 ? tvaRate : null,
    vatRates,
    category: CATEGORIES.has(input.category) ? input.category : 'autres',
    kind: KINDS.has(input.kind) ? input.kind : 'expense',
    documentType: text(input.documentType, 40) || 'facture',
    confidence: confidenceMap(input.confidence),
  };
}

export function invoiceConsistency({ amountHT, tva, amountTTC }, tolerance = 0.02) {
  const ht = parseTunisianAmount(amountHT);
  const vat = parseTunisianAmount(tva);
  const ttc = parseTunisianAmount(amountTTC);
  if (ht === null || vat === null || ttc === null) return { complete: false, consistent: true, difference: null };
  const difference = Math.round(Math.abs((ht + vat) - ttc) * 1000) / 1000;
  return { complete: true, consistent: difference <= tolerance, difference };
}

export function invoiceFingerprint({ vendor, invoiceNumber, reference, date }) {
  const normalizedVendor = text(vendor, 180).toLocaleLowerCase('fr').normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]/gu, '');
  const normalizedNumber = text(invoiceNumber || reference, 100).toLocaleUpperCase('fr').replace(/[^\p{L}\p{N}]/gu, '');
  const normalizedDate = normalizeInvoiceDate(date) || '';
  return normalizedVendor && normalizedNumber && normalizedDate ? `${normalizedVendor}|${normalizedNumber}|${normalizedDate}` : '';
}

export function validateConfirmedInvoice(input) {
  const normalized = normalizeOcrExtraction(input || {});
  const errors = {};
  if (!normalized.vendor) errors.vendor = 'Le fournisseur ou client est obligatoire.';
  if (!normalized.invoiceNumber) errors.invoiceNumber = 'Le numéro de facture est obligatoire.';
  if (!normalized.date) errors.date = 'La date de facture est invalide.';
  if (normalized.amountTTC === null) errors.amountTTC = 'Le montant TTC est invalide.';
  const consistency = invoiceConsistency(normalized);
  const fingerprint = invoiceFingerprint(normalized);
  return { ok: Object.keys(errors).length === 0 && Boolean(fingerprint), normalized, errors, consistency, fingerprint };
}

export function safeOcrSnapshot(value) {
  try {
    const json = JSON.stringify(value);
    if (!json || json.length > 100_000) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}
