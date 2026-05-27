import { Suspense, lazy } from "react";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/Landing";

// ⚡ Bolt: Code Splitting Optimization
// Lazy load route components to reduce Vite chunk sizes and improve Time to Interactive.
// LandingPage is kept synchronous as it is the most common entry point.
const TrackPage = lazy(() => import("@/pages/Track"));
const AdminPage = lazy(() => import("@/pages/Admin"));
const UserAuth = lazy(() => import("@/pages/UserAuth"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-[#fbbf24] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
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
