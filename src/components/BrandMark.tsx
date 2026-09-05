export function BrandMark({
  name,
  className = "",
  accentClassName = "text-teal",
}: {
  name: string;
  className?: string;
  accentClassName?: string;
}) {
  const trimmed = name.trim() || "PhoneRepairO";
  if (/o$/i.test(trimmed) && trimmed.length > 1) {
    return (
      <span className={`brand-mark ${className}`}>
        {trimmed.slice(0, -1)}
        <span className={accentClassName}>{trimmed.slice(-1)}</span>
      </span>
    );
  }
  return <span className={`brand-mark ${className}`}>{trimmed}</span>;
}
