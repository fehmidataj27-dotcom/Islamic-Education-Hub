import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    username?: string;
    studentId?: string;
    profileImageUrl?: string;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    testLogin: (role: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/user");
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Auth check failed", err);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/login/local", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                toast({
                    title: "Welcome back!",
                    description: `Logged in as ${data.role}`,
                });
            } else {
                const error = await res.json();
                throw new Error(error.message || "Login failed");
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: err.message,
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const testLogin = async (role: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/auth/test-login/${role}`, {
                method: "POST"
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
                toast({
                    title: "Testing Mode Active",
                    description: `Logged in as ${data.role}`,
                });
            } else {
                const error = await res.json();
                throw new Error(error.message || "Test login failed");
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Test Login Failed",
                description: err.message,
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/signup/local", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const newUser = await res.json();
                // After signup, we need to login
                await login(data.username || data.studentId || data.email, data.password);
            } else {
                const error = await res.json();
                throw new Error(error.message || "Signup failed");
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: err.message,
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/logout");
            setUser(null);
            window.location.href = "/login";
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, testLogin, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}

