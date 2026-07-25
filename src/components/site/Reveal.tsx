import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  style?: CSSProperties;
};

/**
 * Lightweight scroll-in reveal. Uses IntersectionObserver + a data attribute
 * that CSS transitions to `data-reveal="in"`. Fires once, then disconnects.
 */
export function Reveal({ children, delay = 0, as = "div", className, style }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-reveal", "in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute("data-reveal", "in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as as unknown as "div";
  return (
    <Tag
      // @ts-expect-error dynamic ref
      ref={ref}
      data-reveal=""
      className={className}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}