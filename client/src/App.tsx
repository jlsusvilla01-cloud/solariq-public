import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";

// ⚡ Bolt Performance Optimization: Code Splitting
// Replaced synchronous imports with React.lazy to reduce the initial JS bundle size.
// Impact: Faster initial page load times, especially for users not accessing all routes immediately.
const LandingPage = lazy(() => import("@/pages/Landing"));
const TrackPage = lazy(() => import("@/pages/Track"));
const AdminPage = lazy(() => import("@/pages/Admin"));
const UserAuth = lazy(() => import("@/pages/UserAuth"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/track/:token" component={TrackPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/admin/:tab" component={AdminPage} />
            <Route path="/signin">{() => <UserAuth mode="signin" />}</Route>
            <Route path="/signup">{() => <UserAuth mode="signup" />}</Route>
            <Route path="/dashboard" component={UserDashboard} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
