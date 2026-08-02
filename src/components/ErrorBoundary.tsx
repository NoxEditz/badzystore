import { useRouter } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
  routeName?: string;
}

export function RouteErrorBoundary({ error, reset, routeName }: ErrorBoundaryProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(`[${routeName || "Route"}] Error:`, error);
  }, [error, routeName]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-2 ring-destructive/20">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {routeName ? `${routeName} Error` : "Something went wrong"}
        </h1>
        
        <p className="mt-3 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. You can try refreshing or return to the homepage."}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go Home
          </a>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-6 rounded-lg border border-border bg-card p-4 text-left">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-3 overflow-x-auto text-xs text-foreground">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
