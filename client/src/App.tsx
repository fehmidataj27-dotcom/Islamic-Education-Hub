import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import RecordedClasses from "@/pages/RecordedClasses";
import Flashcards from "@/pages/Flashcards";
import SalaahTracker from "@/pages/SalaahTracker";
import Leaderboard from "@/pages/Leaderboard";
import Attendance from "@/pages/Attendance";
import ProgressReports from "@/pages/ProgressReports";
import Fees from "@/pages/Fees";
import UserManagement from "@/pages/UserManagement";
import Communication from "@/pages/Communication";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import Achievements from "@/pages/Achievements";
import Quizzes from "@/pages/Quizzes";
import Quran from "@/pages/Quran";
import LiveClasses from "@/pages/LiveClasses";
import Tutor from "@/pages/Tutor";
import Books from "@/pages/Books";
import SalahCourse from "@/pages/SalahCourse";
import TafseerCourse from "@/pages/TafseerCourse";
import TajweedCourse from "@/pages/TajweedCourse";
import HadeesCourse from "@/pages/HadeesCourse";
import Groups from "@/pages/Groups";
import GroupDetail from "@/pages/GroupDetail";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function Router() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuthContext();

  // Redirect logged-in user from "/" to their role home
  useEffect(() => {
    if (!isLoading && user && location === "/") {
      const roleStr = user.role.toLowerCase();
      if (roleStr === 'admin') setLocation('/user-management');
      else if (roleStr === 'teacher') setLocation('/attendance');
      else if (roleStr === 'parent') setLocation('/progress-reports');
      else setLocation('/dashboard');
    }
  }, [isLoading, user, location]);

  // While auth state is loading, show a centered spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Public Routes (do not wrap in Layout)
  if (["/login", "/forgot-password", "/"].includes(location)) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
      </Switch>
    );
  }

  // Protected Routes (Wrapped in Layout)
  // All routes here require authentication and will be rendered within the Layout.
  // ProtectedRoute component handles redirection to login if not authenticated.
  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/books" component={Books} />
        <ProtectedRoute path="/quran" component={Quran} />
        <ProtectedRoute path="/live" component={LiveClasses} />
        <ProtectedRoute path="/tutor" component={Tutor} />
        <ProtectedRoute path="/quizzes" component={Quizzes} />
        <ProtectedRoute path="/achievements" component={Achievements} />
        <ProtectedRoute path="/library" component={Library} />
        <ProtectedRoute path="/recorded-classes" component={RecordedClasses} />
        <ProtectedRoute path="/flashcards" component={Flashcards} />
        <ProtectedRoute path="/salaah-tracker" component={SalaahTracker} />
        <ProtectedRoute path="/leaderboard" component={Leaderboard} />
        <ProtectedRoute path="/attendance" component={Attendance} allowedRoles={['teacher', 'admin', 'student']} />
        <ProtectedRoute path="/progress-reports" component={ProgressReports} allowedRoles={['parent', 'admin']} />
        <ProtectedRoute path="/fees" component={Fees} allowedRoles={['admin', 'parent']} />
        <ProtectedRoute path="/user-management" component={UserManagement} allowedRoles={['admin']} />
        <ProtectedRoute path="/communication" component={Communication} />
        <ProtectedRoute path="/salah-course" component={SalahCourse} />
        <ProtectedRoute path="/tafseer-course" component={TafseerCourse} />
        <ProtectedRoute path="/tajweed-course" component={TajweedCourse} />
        <ProtectedRoute path="/hadees-course" component={HadeesCourse} />
        <ProtectedRoute path="/groups" component={Groups} />
        <ProtectedRoute path="/groups/:id" component={GroupDetail} />

        {/* Default fallback for authenticated users */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
