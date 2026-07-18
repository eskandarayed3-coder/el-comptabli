export default function EmptyState({ icon = '🗂️', text }) {
  return (
    <div className="empty">
      <div className="big">{icon}</div>
      <p className="small">{text}</p>
    </div>
  );
}
