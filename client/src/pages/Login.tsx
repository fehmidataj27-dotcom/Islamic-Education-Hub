import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Moon, Sun, Globe } from "lucide-react";

export default function Login() {
    const { login, testLogin } = useAuthContext();
    const [, setLocation] = useLocation();
    const { theme, setTheme, lang, setLang } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const t = {
        title: lang === 'en' ? 'Welcome Back' : 'خوش آمدید',
        subtitle: lang === 'en' ? 'Sign in to your account' : 'اپنے اکاؤنٹ میں سائن ان کریں',
        username: lang === 'en' ? 'Username' : 'یوزر نیم',
        password: lang === 'en' ? 'Password' : 'پاس ورڈ',
        remember: lang === 'en' ? 'Remember me' : 'مجھے یاد رکھیں',
        forgot: lang === 'en' ? 'Forgot password?' : 'پاس ورڈ بھول گئے؟',
        login: lang === 'en' ? 'Login' : 'لاگ ان کریں',
        noAccount: lang === 'en' ? "Don't have an account?" : 'اکاؤنٹ نہیں ہے؟',
        signup: lang === 'en' ? 'Sign up' : 'سائن اپ کریں',
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password); // Note: variable 'email' is used for the username field value here
            setLocation("/dashboard");
        } catch (error) {
            // Toast handled in context
        } finally {
            setLoading(false);
        }
    };

    const loginAsDemo = async (role: string) => {
        setLoading(true);
        try {
            await testLogin(role);
            const user = JSON.parse(localStorage.getItem("islamic_hub_user") || "{}");
            // Roles are normalized to lower case in our mock login
            const lowerRole = role.toLowerCase();
            if (lowerRole === 'admin') setLocation("/user-management");
            else if (lowerRole === 'teacher') setLocation("/attendance");
            else if (lowerRole === 'parent') setLocation("/progress-reports");
            else setLocation("/dashboard");
        } catch (error) {
            // Toast handled in context
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}>
                    <Globe className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-primary/10">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                    <CardDescription>{t.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">{lang === 'en' ? 'Username / Student ID' : 'یوزر نیم / اسٹوڈنٹ آئی ڈی'}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="stu123 or ahmed_ali"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">{t.password}</Label>
                                <Link href="/forgot-password">
                                    <span className="text-sm font-medium text-primary hover:underline cursor-pointer">{t.forgot}</span>
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(!!c)} />
                            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">{t.remember}</Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.login}
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </div>
    );
}
