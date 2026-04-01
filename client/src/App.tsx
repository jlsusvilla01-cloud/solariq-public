import { lazy, Suspense } from "react";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// ⚡ Bolt: Code splitting at the route level to reduce initial bundle size
// Lazy loading page components prevents loading the entire app upfront.
const LandingPage = lazy(() => import("@/pages/Landing"));
const TrackPage = lazy(() => import("@/pages/Track"));
const AdminPage = lazy(() => import("@/pages/Admin"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-border" /></div>}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/track/:token" component={TrackPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/admin/:tab" component={AdminPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
