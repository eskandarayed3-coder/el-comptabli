export default function SuggestionChips({ items, onPick }) {
  return (
    <div className="scroll-x">
      {items.map((s, i) => (
        <button key={i} className="chip outline-teal" onClick={() => onPick(s)}>{s}</button>
      ))}
    </div>
  );
}
