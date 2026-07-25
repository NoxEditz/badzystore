import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const SHOW_DELAY_MS = 80;
const MIN_VISIBLE_MS = 420;

export function RouteLoadingScreen() {
  const isLoading = useRouterState({
    select: (state) => state.status === "pending",
  });
  const [documentReady, setDocumentReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [shownAt, setShownAt] = useState(() => Date.now());

  useEffect(() => {
    if (document.readyState === "complete") {
      setDocumentReady(true);
      return;
    }

    const handleLoad = () => setDocumentReady(true);
    window.addEventListener("load", handleLoad, { once: true });
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const canHide = documentReady && !isLoading;

    if (isLoading) {
      timer = setTimeout(() => {
        setShownAt(Date.now());
        setVisible(true);
      }, SHOW_DELAY_MS);
    } else if (visible && canHide) {
      const elapsed = Date.now() - shownAt;
      timer = setTimeout(() => setVisible(false), Math.max(MIN_VISIBLE_MS - elapsed, 0));
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [documentReady, isLoading, shownAt, visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-background text-foreground">
      <div className="badzy-grid absolute inset-0 opacity-60" />
      <div className="badzy-orb animate-drift left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-primary)_45%,transparent)_0%,transparent_68%)] blur-2xl" />

      <div className="relative grid place-items-center px-6">
        <div className="relative grid h-28 w-28 place-items-center">
          <div className="absolute inset-0 rounded-full border border-primary/20" />
          <div className="absolute inset-1 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
          <div className="absolute inset-5 rounded-full border-b-2 border-l-2 border-primary/70 animate-[spin_1.7s_linear_infinite_reverse]" />
          <div className="grid h-28 w-28 place-items-center drop-shadow-[0_0_26px_var(--color-primary)]">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="Badzy Store" className="h-full w-full object-contain" />
            </picture>
          </div>
          <span className="absolute -right-1 top-6 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_4px_var(--color-primary)]" />
          <span className="absolute bottom-5 left-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
        </div>
      </div>
    </div>
  );
}