export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block h-4 rounded bg-cream-200 motion-safe:animate-pulse ${className}`} />;
}
