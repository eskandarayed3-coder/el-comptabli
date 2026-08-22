export default function FAB({ icon: Icon, label, onClick, style }) {
  return (
    <button type="button" className="fab" onClick={onClick} style={style} aria-label={label}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      <span>{label}</span>
    </button>
  );
}
