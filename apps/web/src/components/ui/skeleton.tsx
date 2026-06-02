export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg border border-border bg-surface-muted ${className}`}
      aria-hidden
    />
  );
}

export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
