import assert from 'node:assert/strict';
import test from 'node:test';
import {
  invoiceConsistency,
  invoiceFingerprint,
  normalizeOcrExtraction,
  parseTunisianAmount,
  validateConfirmedInvoice,
} from '../../shared/invoice.js';
import { ownedPath } from '../routes/documents.js';
import { validateImagePayload } from './validation.js';

test('1. normalizes French invoice fields without inventing values', () => {
  const invoice = normalizeOcrExtraction({
    fournisseur: 'Société Atlas', numeroFacture: 'FAC-2026-41', date: '23/08/2026',
    amountHT: '1 000,000 DT', tva: '190,000 DT', amountTTC: '1 190,000 TND',
    matriculeFiscal: '1234567 / A / M / 000', tvaRate: 19,
  });
  assert.equal(invoice.vendor, 'Société Atlas');
  assert.equal(invoice.invoiceNumber, 'FAC-2026-41');
  assert.equal(invoice.date, '2026-08-23');
  assert.equal(invoice.supplierTaxId, '1234567/A/M/000');
  assert.equal(invoice.amountTTC, 1190);
});

test('2. accepts a PDF only when its binary signature is PDF', () => {
  assert.equal(validateImagePayload({ mimeType: 'application/pdf', dataBase64: Buffer.from('%PDF-1.7\nsynthetic').toString('base64') }).ok, true);
  assert.equal(validateImagePayload({ mimeType: 'application/pdf', dataBase64: Buffer.from('not a pdf').toString('base64') }).ok, false);
});

test('3. accepts a JPEG only when its binary signature is JPEG', () => {
  assert.equal(validateImagePayload({ mimeType: 'image/jpeg', dataBase64: Buffer.from([0xff, 0xd8, 0xff, 0xdb]).toString('base64') }).ok, true);
  assert.equal(validateImagePayload({ mimeType: 'image/jpeg', dataBase64: Buffer.from('fake').toString('base64') }).ok, false);
});

test('4. parses decimal comma and Tunisian millimes', () => {
  assert.equal(parseTunisianAmount('1 234,500'), 1234.5);
  assert.equal(parseTunisianAmount('12,750'), 12.75);
});

test('5. parses decimal point', () => {
  assert.equal(parseTunisianAmount('1234.500'), 1234.5);
  assert.equal(parseTunisianAmount('19.25'), 19.25);
});

test('6. strips TND, DT and dinar labels', () => {
  assert.equal(parseTunisianAmount('2 410,000 TND'), 2410);
  assert.equal(parseTunisianAmount('90.250 DT'), 90.25);
  assert.equal(parseTunisianAmount('15 dinars'), 15);
});

test('7. keeps missing and low-confidence OCR fields visible for review', () => {
  const invoice = normalizeOcrExtraction({ vendor: null, amountTTC: '10', confidence: { vendor: 0.2, amountTTC: 92 } });
  assert.equal(invoice.vendor, '');
  assert.equal(invoice.confidence.vendor, 0.2);
  assert.equal(invoice.confidence.amountTTC, 0.92);
  assert.equal(validateConfirmedInvoice(invoice).ok, false);
});

test('8. flags HT + VAT totals that do not match TTC', () => {
  assert.deepEqual(invoiceConsistency({ amountHT: '100', tva: '19', amountTTC: '119' }).consistent, true);
  const inconsistent = invoiceConsistency({ amountHT: '100', tva: '19', amountTTC: '130' });
  assert.equal(inconsistent.consistent, false);
  assert.equal(inconsistent.difference, 11);
});

test('9. creates the same duplicate fingerprint despite spacing and accents', () => {
  const a = invoiceFingerprint({ vendor: 'Société Atlas', invoiceNumber: 'FAC- 41', date: '23/08/2026' });
  const b = invoiceFingerprint({ vendor: 'societe-atlas', invoiceNumber: 'fac41', date: '2026-08-23' });
  assert.equal(a, b);
  assert.ok(a);
});

test('10. user A can never address user B storage paths', () => {
  const userA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const userB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  assert.equal(ownedPath(userA, `${userA}/invoice.pdf`), `${userA}/invoice.pdf`);
  assert.equal(ownedPath(userA, `${userB}/invoice.pdf`), null);
  assert.equal(ownedPath(userA, `${userA}/../${userB}/invoice.pdf`), null);
});

test('Arabic OCR aliases and multiple VAT rates remain reviewable', () => {
  const invoice = normalizeOcrExtraction({
    supplier: 'شركة النور', invoiceNumber: 'ف ١٢٣', date: '2026-08-23',
    amountTTC: '١١٩,000 د.ت', vatRates: [7, 19], kind: 'expense',
  });
  assert.equal(invoice.vendor, 'شركة النور');
  assert.equal(invoice.amountTTC, 119);
  assert.deepEqual(invoice.vatRates, [7, 19]);
});
