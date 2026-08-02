import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";

export const Route = createFileRoute("/test-error")({
  component: TestErrorPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorBoundary error={error} reset={reset} routeName="Test Error" />
  ),
});

function TestErrorPage() {
  // Deliberately throw an error to test the boundary
  throw new Error("This is a test error to verify the error boundary works!");
  
  return <div>You should never see this</div>;
}
