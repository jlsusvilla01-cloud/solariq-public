import { Router, Switch, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "@/pages/Landing";
import TrackPage from "@/pages/Track";
import AdminPage from "@/pages/Admin";
import UserAuth from "@/pages/UserAuth";
import UserDashboard from "@/pages/UserDashboard";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
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
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
