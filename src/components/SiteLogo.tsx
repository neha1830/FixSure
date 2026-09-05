export function SiteLogo({
  className = "",
  size = "md",
  /** Light logo for dark backgrounds (hero / dark footer) */
  onDark = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
}) {
  const dims =
    size === "sm"
      ? "h-9 w-auto max-w-[3.25rem]"
      : size === "lg"
        ? "h-14 w-auto max-w-[6rem] sm:h-16 sm:max-w-[7rem]"
        : "h-11 w-auto max-w-[4rem]";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png?v=3"
      alt=""
      className={`bg-transparent object-contain object-left ${dims} ${
        onDark ? "brightness-0 invert" : ""
      } ${className}`}
    />
  );
}
