export default function StatusPill({ tone = 'teal', children }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
