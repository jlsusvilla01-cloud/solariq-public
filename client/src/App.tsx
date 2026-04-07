import React, { lazy, Suspense } from "react";
import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

const LandingPage = lazy(() => import("@/pages/Landing"));
const TrackPage = lazy(() => import("@/pages/Track"));
const AdminPage = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/not-found"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white/50">Loading...</div>}>
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
