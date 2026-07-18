export default function Stepper({ value, onChange, min = 0, max = 12 }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))} aria-label="-">−</button>
      <span className="val num">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} aria-label="+">+</button>
    </div>
  );
}
