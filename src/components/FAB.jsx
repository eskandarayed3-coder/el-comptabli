export default function FAB({ icon: Icon, label, onClick, style }) {
  return (
    <button className="fab" onClick={onClick} style={style}>
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </button>
  );
}
