import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { useEffect, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const Landing = lazy(() => import("@/pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Library = lazy(() => import("@/pages/Library"));
const RecordedClasses = lazy(() => import("@/pages/RecordedClasses"));
const Flashcards = lazy(() => import("@/pages/Flashcards"));
const SalaahTracker = lazy(() => import("@/pages/SalaahTracker"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const ProgressReports = lazy(() => import("@/pages/ProgressReports"));
const Fees = lazy(() => import("@/pages/Fees"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const Communication = lazy(() => import("@/pages/Communication"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Quizzes = lazy(() => import("@/pages/Quizzes"));
const Quran = lazy(() => import("@/pages/Quran"));
const LiveClasses = lazy(() => import("@/pages/LiveClasses"));
const Tutor = lazy(() => import("@/pages/Tutor"));
const Books = lazy(() => import("@/pages/Books"));
const SalahCourse = lazy(() => import("@/pages/SalahCourse"));
const TafseerCourse = lazy(() => import("@/pages/TafseerCourse"));
const TajweedCourse = lazy(() => import("@/pages/TajweedCourse"));
const HadeesCourse = lazy(() => import("@/pages/HadeesCourse"));
const Groups = lazy(() => import("@/pages/Groups"));
const GroupDetail = lazy(() => import("@/pages/GroupDetail"));

function Router() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuthContext();

  // Remove auto-redirect so the Front Page is always visible manually.

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
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
        </Switch>
      </Suspense>
    );
  }

  // Protected Routes (Wrapped in Layout)
  // All routes here require authentication and will be rendered within the Layout.
  // ProtectedRoute component handles redirection to login if not authenticated.
  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-80px)]"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
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
      </Suspense>
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
