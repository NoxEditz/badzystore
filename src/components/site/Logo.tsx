import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight ${className}`}
      aria-label="Badzy Store home"
    >
      <picture>
        <source srcSet="/logo.webp" type="image/webp" />
        <img src="/logo.png" alt="Badzy Store Logo" className="h-12 w-auto object-contain" />
      </picture>
    </Link>
  );
}