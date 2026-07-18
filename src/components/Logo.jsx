// App logo (EC monogram + calculator). Source of truth: /public/icon.svg
export default function Logo({ size = 72, radius, style }) {
  return (
    <img
      src="/icon.svg"
      width={size}
      height={size}
      alt="El Comptabli"
      style={{ borderRadius: radius ?? size * 0.22, display: 'block', ...style }}
    />
  );
}
