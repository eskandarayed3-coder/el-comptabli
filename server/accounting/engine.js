export function moneyToMillis(value) {
  const raw = String(value ?? '').trim().replace(',', '.');
  if (!/^-?\d{1,15}(?:\.\d{1,3})?$/.test(raw)) throw new TypeError('invalid money');
  const negative = raw.startsWith('-');
  const [whole, fraction = ''] = (negative ? raw.slice(1) : raw).split('.');
  const mills = BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, '0'));
  return negative ? -mills : mills;
}

export function millisToMoney(value) {
  const mills = BigInt(value);
  const absolute = mills < 0n ? -mills : mills;
  return `${mills < 0n ? '-' : ''}${absolute / 1000n}.${String(absolute % 1000n).padStart(3, '0')}`;
}

export function validateBalancedLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2 || lines.length > 500) return { ok: false, reason: 'line_count' };
  let debit = 0n;
  let credit = 0n;
  try {
    for (const line of lines) {
      const d = moneyToMillis(line?.debit ?? 0);
      const c = moneyToMillis(line?.credit ?? 0);
      if (d < 0n || c < 0n || (d > 0n) === (c > 0n)) return { ok: false, reason: 'meaningless_line' };
      debit += d;
      credit += c;
    }
  } catch {
    return { ok: false, reason: 'invalid_money' };
  }
  return { ok: debit > 0n && debit === credit, debit: millisToMoney(debit), credit: millisToMoney(credit), reason: debit === credit ? null : 'unbalanced' };
}

export function statementSection(accountClass) {
  const value = Number(accountClass);
  if (value >= 1 && value <= 5) return 'balance_sheet';
  if (value === 6) return 'expense';
  if (value === 7) return 'revenue';
  return 'other';
}

export function vatNet({ collected = '0', deductible = '0', adjustments = '0' }) {
  return millisToMoney(moneyToMillis(collected) - moneyToMillis(deductible) + moneyToMillis(adjustments));
}
