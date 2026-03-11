import { useAuthContext } from "@/context/AuthContext";
import { Route, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
    path,
    component: Component,
    allowedRoles
}: {
    path: string;
    component: React.ComponentType<any>;
    allowedRoles?: string[];
}) {
    const { user, isLoading } = useAuthContext();
    const [location, setLocation] = useLocation();

    if (isLoading) {
        return (
            <Route path={path}>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Route>
        );
    }

    if (!user) {
        if (location !== "/login") {
            setTimeout(() => setLocation("/login"), 0);
        }
        return null;
    }

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
        // Redirect to their role-appropriate home page
        const roleStr = user.role.toLowerCase();
        const roleHome =
            roleStr === 'admin' ? '/user-management' :
                roleStr === 'teacher' ? '/attendance' :
                    roleStr === 'parent' ? '/progress-reports' :
                        '/dashboard';
        if (location !== roleHome) {
            setTimeout(() => setLocation(roleHome), 0);
        }
        return null;
    }

    return <Route path={path} component={Component} />;
}

