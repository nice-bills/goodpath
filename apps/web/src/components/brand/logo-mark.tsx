import type { SVGProps } from "react";

const MARK_SIZES = {
  sm: 16,
  nav: 36,
  lg: 64,
} as const;

export type LogoMarkSize = keyof typeof MARK_SIZES;

function TrailMarkPaths() {
  return (
    <>
      <rect width="64" height="64" rx="18" fill="#007a55" />
      <path
        d="M18 48 L18 40 M18 34 L18 26 M18 20 L18 14"
        stroke="#f7f6f3"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="5 4"
      />
      <path
        d="M30 16 L44 24 L30 32"
        stroke="#f7f6f3"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 32 L44 40 L30 48"
        stroke="#f7f6f3"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="44" cy="48" r="4" fill="#f7f6f3" />
    </>
  );
}

export function LogoMark({
  size = "nav",
  className,
  ...props
}: {
  size?: LogoMarkSize;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "width" | "height" | "viewBox">) {
  const px = MARK_SIZES[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      className={className}
      style={{ display: "block", flexShrink: 0 }}
      {...props}
    >
      <TrailMarkPaths />
    </svg>
  );
}

export function LogoLockup({
  size = "nav",
  className,
  wordmarkClassName,
}: {
  size?: LogoMarkSize;
  className?: string;
  wordmarkClassName?: string;
}) {
  const px = MARK_SIZES[size];
  const wordmarkSize =
    size === "sm" ? "text-[13px]" : size === "nav" ? "text-[1.15rem]" : "text-2xl";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span
        className={`font-display italic leading-none tracking-tight text-foreground ${wordmarkSize} ${wordmarkClassName ?? ""}`}
      >
        GoodPath
      </span>
    </span>
  );
}
