export default function TintCard({ tone = 'gray', className = '', children, onClick, inner = false, ariaLabel }) {
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onClick(event);
  };

  return (
    <div
      className={`card tint-${tone} ${inner ? 'inner' : ''} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? ariaLabel : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      style={onClick ? { width: '100%', textAlign: 'start', cursor: 'pointer' } : undefined}
    >
      {children}
    </div>
  );
}
