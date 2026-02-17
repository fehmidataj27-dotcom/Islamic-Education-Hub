import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Books from "@/pages/Books";
import Tutor from "@/pages/Tutor";
import Quran from "@/pages/Quran";
import Quizzes from "@/pages/Quizzes";
import LiveClasses from "@/pages/LiveClasses";
import Achievements from "@/pages/Achievements";
import NotFound from "@/pages/not-found";

// Placeholder components for routes not fully implemented in this generation step
// but required for the complete routing structure
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-muted-foreground">This module is under development.</p>
  </div>
);

function AuthenticatedApp() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/books" component={Books} />
        <Route path="/tutor" component={Tutor} />
        <Route path="/quran" component={Quran} />
        <Route path="/quizzes" component={Quizzes} />
        <Route path="/live" component={LiveClasses} />
        <Route path="/achievements" component={Achievements} />
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
