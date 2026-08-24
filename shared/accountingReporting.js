const number = (value) => Number(value || 0);

export function postedMonthTotals(lines = [], yearMonth = '') {
  const monthLines = lines.filter((line) => String(line.entry_date || '').startsWith(yearMonth));
  const income = monthLines.filter((line) => Number(line.account_class) === 7)
    .reduce((sum, line) => sum + number(line.credit) - number(line.debit), 0);
  const expense = monthLines.filter((line) => Number(line.account_class) === 6)
    .reduce((sum, line) => sum + number(line.debit) - number(line.credit), 0);
  return { income, expense, profit: income - expense };
}

export function postedVatPosition(rows = [], yearMonth = '') {
  const monthRows = rows.filter((row) => String(row.period_month || '').startsWith(yearMonth));
  const collected = monthRows.filter((row) => row.kind === 'income')
    .reduce((sum, row) => sum + number(row.tax_amount), 0);
  const deductible = monthRows.filter((row) => row.kind === 'expense')
    .reduce((sum, row) => sum + number(row.tax_amount), 0);
  return { collected, deductible, due: collected - deductible };
}

export function postedCategoryTotals(lines = [], yearMonth = '', accountClass = 6) {
  const totals = new Map();
  for (const line of lines) {
    if (!String(line.entry_date || '').startsWith(yearMonth) || Number(line.account_class) !== accountClass) continue;
    const key = line.reporting_category || line.account_label || 'unmapped';
    const value = accountClass === 7
      ? number(line.credit) - number(line.debit)
      : number(line.debit) - number(line.credit);
    totals.set(key, (totals.get(key) || 0) + value);
  }
  return [...totals.entries()].map(([id, value]) => ({ id, value }));
}

export function postedWeeklyRevenue(lines = [], yearMonth = '') {
  const weeks = [0, 0, 0, 0, 0];
  for (const line of lines) {
    if (!String(line.entry_date || '').startsWith(yearMonth) || Number(line.account_class) !== 7) continue;
    const day = Number(String(line.entry_date).slice(8, 10));
    if (!Number.isInteger(day) || day < 1 || day > 31) continue;
    weeks[Math.min(4, Math.floor((day - 1) / 7))] += number(line.credit) - number(line.debit);
  }
  return weeks;
}

export function postedEntryCount(lines = [], yearMonth = '', accountClass = null) {
  return new Set(lines.filter((line) => (
    String(line.entry_date || '').startsWith(yearMonth)
    && (accountClass === null || Number(line.account_class) === accountClass)
  )).map((line) => line.entry_id)).size;
}

export function postedYearTotals(lines = [], year = '') {
  return Array.from({ length: 12 }, (_, monthIndex) => {
    const yearMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    return { yearMonth, ...postedMonthTotals(lines, yearMonth) };
  });
}
