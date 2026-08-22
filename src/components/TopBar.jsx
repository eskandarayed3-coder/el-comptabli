import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function TopBar({ title, onBack, right, subtitle, backLabel = 'Retour' }) {
  const navigate = useNavigate();
  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="top-bar">
        {onBack !== null && (
          <button className="back" type="button" onClick={() => (onBack ? onBack() : navigate(-1))} aria-label={backLabel}>
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        )}
        <h1 className="grow">{title}</h1>
        {right}
      </div>
      {subtitle && <p className="muted small">{subtitle}</p>}
    </div>
  );
}
