import { lazy, Suspense } from "react";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/Landing";

// ⚡ BOLT OPTIMIZATION:
// Code-split heavy route components to reduce initial bundle size and speed up root load time.
// LandingPage is kept synchronous as it's critical for initial render.
// Expected Impact: Reduces main bundle size and improves Time To Interactive (TTI) for new users.
const TrackPage = lazy(() => import("@/pages/Track"));
const AdminPage = lazy(() => import("@/pages/Admin"));
const UserAuth = lazy(() => import("@/pages/UserAuth"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>}>
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
