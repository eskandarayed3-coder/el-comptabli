export default function FilterPills({ options, value, onChange }) {
  return (
    <div className="scroll-x">
      {options.map((o) => (
        <button key={o.id} className={`chip ${value === o.id ? 'active' : ''}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
