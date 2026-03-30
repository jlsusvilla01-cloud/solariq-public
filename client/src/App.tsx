import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/not-found";

const LandingPage = lazy(() => import("@/pages/Landing"));
const TrackPage = lazy(() => import("@/pages/Track"));
const AdminPage = lazy(() => import("@/pages/Admin"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Suspense fallback={<div className="min-h-screen bg-[hsl(220_28%_6%)] flex items-center justify-center"><div className="w-12 h-12 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" /></div>}>
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
