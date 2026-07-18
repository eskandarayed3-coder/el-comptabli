export default function Toggle({ on, onClick }) {
  return (
    <button
      className={`toggle ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      onClick={onClick}
    />
  );
}
