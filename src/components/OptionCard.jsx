import { CheckCircle2 } from 'lucide-react';

export default function OptionCard({ icon: Icon, title, subtitle, selected, onClick, tone = 'teal' }) {
  return (
    <button className={`option-card ${tone === 'indigo' ? 'indigo' : ''} ${selected ? 'selected' : ''}`} onClick={onClick}>
      {Icon && <Icon size={22} color={selected ? 'var(--teal-700)' : 'var(--text-2)'} />}
      <span className="col" style={{ gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        {subtitle && <span className="tiny muted">{subtitle}</span>}
      </span>
      {selected && <CheckCircle2 size={20} className="check" fill="var(--teal-400)" color="#fff" />}
    </button>
  );
}
