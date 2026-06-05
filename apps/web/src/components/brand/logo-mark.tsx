import type { SVGProps } from "react";

const MARK_SIZES = {
  sm: 16,
  nav: 36,
  lg: 64,
} as const;

export type LogoMarkSize = keyof typeof MARK_SIZES;

function TraceMarkPaths() {
  return (
    <>
      <rect width="64" height="64" rx="18" fill="#007a55" />
      <path
        d="M16 46 C16 46 22 28 32 22 C42 16 48 24 48 24"
        stroke="#f7f6f3"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="48" cy="24" r="4" fill="#f7f6f3" />
      <circle cx="32" cy="22" r="2.5" fill="#007a55" opacity={0.85} />
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
      <TraceMarkPaths />
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
