import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title, text, action }) {
  const icon = typeof Icon === 'string' ? Icon : <Icon size={28} strokeWidth={1.8} />;
  return (
    <div className="empty">
      <span className="empty-icon" aria-hidden="true">{icon}</span>
      {title && <h2>{title}</h2>}
      <p className="small">{text}</p>
      {action}
    </div>
  );
}
