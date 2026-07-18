export default function TintCard({ tone = 'gray', className = '', children, onClick, inner = false }) {
  return (
    <div
      className={`card tint-${tone} ${inner ? 'inner' : ''} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
      style={onClick ? { width: '100%', textAlign: 'start', cursor: 'pointer' } : undefined}
    >
      {children}
    </div>
  );
}
