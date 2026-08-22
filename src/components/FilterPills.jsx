export default function FilterPills({ options, value, onChange }) {
  return (
    <div className="scroll-x">
      {options.map((o) => (
        <button type="button" key={o.id} className={`chip ${value === o.id ? 'active' : ''}`} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
