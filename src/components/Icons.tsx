import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, className, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...props,
  };
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

export function IconTablet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M11 17.5h2" />
    </svg>
  );
}

export function IconLaptop(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M2 19h20" />
      <path d="M8 16h8" />
    </svg>
  );
}

export function IconWatch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="6.5" width="10" height="11" rx="2.5" />
      <path d="M9 3.5h6M9 20.5h6" />
      <path d="M12 10v2.5l1.5 1" />
    </svg>
  );
}

export function IconScreen(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 18v3" />
      <path d="M7 9l3 3-3 3" />
    </svg>
  );
}

export function IconBattery(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <path d="M20 10v4" />
      <path d="M6 10h6v4H6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCharging(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M13 2 5 13.5h6L9 22l10-13.5h-6L13 2z" />
    </svg>
  );
}

export function IconCamera(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  );
}

export function IconSpeaker(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" />
      <path d="M16 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M18.5 7a6.5 6.5 0 0 1 0 10" />
    </svg>
  );
}

export function IconSoftware(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 9.5 10.5 12 8 14.5M12.5 14.5H16" />
    </svg>
  );
}

export function IconWater(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c3.5 4.5 6 7.8 6 11a6 6 0 1 1-12 0c0-3.2 2.5-6.5 6-11z" />
    </svg>
  );
}

export function IconGlass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8l8 8M15 8l-5 5" />
    </svg>
  );
}

export function IconBackGlass(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <circle cx="12" cy="7" r="1.6" />
      <path d="M8 14l8 4M9 18l6-3" />
    </svg>
  );
}

export function IconOther(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5M12 16.5h.01" />
    </svg>
  );
}

export function IconPrice(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v18M16.5 7.5c0-1.7-1.8-3-4.5-3s-4.5 1.3-4.5 3 1.8 2.7 4.5 3 4.5 1.4 4.5 3-1.8 3-4.5 3-4.5-1.3-4.5-3" />
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

export function IconTrack(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="18" cy="12" r="2.2" />
      <path d="M8.2 12h1.6M14.2 12h1.6" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 4.5 6.5v5.2c0 4.4 3.1 7.7 7.5 9.3 4.4-1.6 7.5-4.9 7.5-9.3V6.5L12 3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </svg>
  );
}

export function IconPrivacy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M5 19.5c1.4-3.2 3.8-4.8 7-4.8s5.6 1.6 7 4.8" />
    </svg>
  );
}

export function IconGallery(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5.5 17 4-4 3 3 2.5-2.5 3.5 3.5" />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.8 7.2 18.4l.9-5.4L4.2 9.2l5.4-.8L12 3.5z" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.2 2.3 2.3 4.7-5" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 6.5a3.5 3.5 0 0 0-4.7 4.7L4 17l3 3 5.8-5.8a3.5 3.5 0 0 0 4.7-4.7L15.5 11.5 14.5 6.5z" />
    </svg>
  );
}

export function IconArrow(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const DEVICE_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  phone: (p) => <IconPhone {...p} />,
  tablet: (p) => <IconTablet {...p} />,
  macbook: (p) => <IconLaptop {...p} />,
  laptop: (p) => <IconLaptop {...p} />,
  smartwatch: (p) => <IconWatch {...p} />,
  watch: (p) => <IconWatch {...p} />,
};

const SERVICE_ICONS: Record<string, (p: IconProps) => ReactNode> = {
  screen: (p) => <IconScreen {...p} />,
  glass: (p) => <IconGlass {...p} />,
  backglass: (p) => <IconBackGlass {...p} />,
  battery: (p) => <IconBattery {...p} />,
  charging: (p) => <IconCharging {...p} />,
  camera: (p) => <IconCamera {...p} />,
  speaker: (p) => <IconSpeaker {...p} />,
  software: (p) => <IconSoftware {...p} />,
  water: (p) => <IconWater {...p} />,
  other: (p) => <IconOther {...p} />,
};

const PROCESS_ICONS = [IconPrice, IconCalendar, IconTrack];

const TRUST_ICONS = [IconWrench, IconLock, IconPrivacy, IconGallery];

export function DeviceIcon({
  deviceKey,
  ...props
}: IconProps & { deviceKey?: string | null }) {
  const key = (deviceKey || "phone").toLowerCase();
  const Comp = DEVICE_ICONS[key] || IconPhone;
  return <>{Comp(props)}</>;
}

export function ServiceIcon({
  serviceKey,
  ...props
}: IconProps & { serviceKey?: string | null }) {
  const key = (serviceKey || "other").toLowerCase();
  const Comp = SERVICE_ICONS[key] || IconWrench;
  return <>{Comp(props)}</>;
}

export function ProcessIcon({
  index,
  ...props
}: IconProps & { index: number }) {
  const Comp = PROCESS_ICONS[index % PROCESS_ICONS.length];
  return <Comp {...props} />;
}

export function TrustIcon({
  index,
  ...props
}: IconProps & { index: number }) {
  const Comp = TRUST_ICONS[index % TRUST_ICONS.length];
  return <Comp {...props} />;
}
