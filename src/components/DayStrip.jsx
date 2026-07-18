import { todayISO } from '../lib/format.js';

const DOW_FR = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const DOW_AR = ['إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت', 'أحد'];

export default function DayStrip({ month, markedDays = {}, lang = 'fr', onPick }) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = todayISO();
  const dow = lang === 'ar' ? DOW_AR : DOW_FR;

  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const iso = `${month}-${String(day).padStart(2, '0')}`;
    const dowIdx = (new Date(y, m - 1, day).getDay() + 6) % 7;
    return { day, iso, dow: dow[dowIdx], isToday: iso === today, marks: markedDays[iso] || [] };
  });

  return (
    <div className="day-strip">
      {cells.map((c) => (
        <button key={c.iso} className={`day-cell ${c.isToday ? 'today' : ''}`} onClick={() => onPick?.(c.iso)}>
          <span className="dow">{c.dow}</span>
          <span className="dom num">{c.day}</span>
          {c.marks.length > 0 && (
            <span className="marks">
              {c.marks.map((tone, i) => <i key={i} style={{ background: `var(--pill-${tone}-fg, var(--teal-700))` }} />)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
