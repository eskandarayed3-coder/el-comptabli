const amount = (value) => Math.round(Math.abs(Number(value || 0)) * 1000) / 1000;
const close = (left, right) => Math.abs(left - right) <= 0.001;

export function expectedJournalType(invoice = {}) {
  return invoice.kind === 'income' ? 'sales' : 'purchases';
}

export function mappingPayload(invoice, selection) {
  for (const field of ['targetAccountId', 'counterpartyAccountId', 'journalId']) {
    if (!selection?.[field]) throw new Error('Choisis le journal, le compte principal et le compte de contrepartie.');
  }
  if (amount(invoice?.vat_amount) > 0 && !selection.vatAccountId) {
    throw new Error('Choisis le compte de TVA correspondant.');
  }
  return {
    thirdPartyId: invoice.third_party_id || null,
    invoiceCategory: invoice.category || null,
    targetAccountId: selection.targetAccountId,
    counterpartyAccountId: selection.counterpartyAccountId,
    vatAccountId: selection.vatAccountId || null,
    journalId: selection.journalId,
    source: 'human',
    confidence: null,
    sourceCondition: { invoiceKind: invoice.kind, documentType: invoice.document_type },
  };
}

export function buildPostingPreview(invoice, selection, accounts = []) {
  const payload = mappingPayload(invoice, selection);
  const byId = new Map(accounts.map((account) => [account.id, account]));
  const account = (id) => {
    const item = byId.get(id);
    if (!item) throw new Error('Un compte sélectionné est indisponible ou inactif.');
    return { id, number: item.account_number, label: item.label };
  };
  const base = amount(invoice.amount_ht);
  const total = amount(invoice.amount_ttc);
  const declaredVat = amount(invoice.vat_amount);
  const taxLines = Array.isArray(invoice.invoice_tax_lines) ? invoice.invoice_tax_lines : [];
  const vatLines = taxLines.filter((line) => line.tax_type === 'vat' && amount(line.tax_amount) > 0);
  const vatTotal = Math.round(vatLines.reduce((sum, line) => sum + amount(line.tax_amount), 0) * 1000) / 1000;

  if (declaredVat > 0 && !vatLines.length) throw new Error('Valide les lignes de TVA avant la comptabilisation.');
  if (!close(declaredVat, vatTotal)) throw new Error('Le total TVA ne correspond pas aux lignes fiscales validées.');
  if (!close(base + vatTotal, total)) {
    throw new Error('Remise, timbre fiscal ou retenue : validation professionnelle requise avant comptabilisation.');
  }
  if (amount(invoice.withholding_tax) > 0) throw new Error('Retenue à la source : validation professionnelle requise.');

  const debitNormal = (invoice.kind === 'expense') !== (invoice.document_type === 'avoir');
  const lines = [];
  const add = (accountId, description, debit, credit) => lines.push({ account: account(accountId), description, debit, credit });
  if (debitNormal) {
    const isIncomeCredit = invoice.kind === 'income' && invoice.document_type === 'avoir';
    add(payload.targetAccountId, isIncomeCredit ? 'Produit annulé' : 'Charge', base, 0);
    for (const line of vatLines) add(payload.vatAccountId, `TVA ${isIncomeCredit ? 'annulée ' : ''}${Number(line.tax_rate || 0)} %`, amount(line.tax_amount), 0);
    add(payload.counterpartyAccountId, isIncomeCredit ? 'Avoir client' : 'Dette fournisseur', 0, total);
  } else {
    const isExpenseCredit = invoice.kind === 'expense' && invoice.document_type === 'avoir';
    add(payload.counterpartyAccountId, isExpenseCredit ? 'Avoir fournisseur' : 'Créance client', total, 0);
    for (const line of vatLines) add(payload.vatAccountId, `TVA ${isExpenseCredit ? 'annulée ' : ''}${Number(line.tax_rate || 0)} %`, 0, amount(line.tax_amount));
    add(payload.targetAccountId, isExpenseCredit ? 'Charge annulée' : 'Produit', 0, base);
  }
  const totalDebit = Math.round(lines.reduce((sum, line) => sum + line.debit, 0) * 1000) / 1000;
  const totalCredit = Math.round(lines.reduce((sum, line) => sum + line.credit, 0) * 1000) / 1000;
  return { lines, totalDebit, totalCredit, balanced: close(totalDebit, totalCredit), payload };
}
