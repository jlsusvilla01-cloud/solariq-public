import { lazy, Suspense } from "react";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/Landing";
import TrackPage from "@/pages/Track";
import UserAuth from "@/pages/UserAuth";
import NotFound from "@/pages/not-found";

// Code splitting for large admin and dashboard pages
const AdminPage = lazy(() => import("@/pages/Admin"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

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
