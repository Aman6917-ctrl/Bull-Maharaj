import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import { useEffect, useState } from "react";

function Router() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    // Check if there's a session by making a request to fetch user data
    fetch('/api/portfolio', { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Redirect to login if not authenticated and trying to access protected routes
  useEffect(() => {
    if (!isAuthenticated && location !== '/login' && location !== '/') {
      window.location.href = '/login';
    }
  }, [isAuthenticated, location]);

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
