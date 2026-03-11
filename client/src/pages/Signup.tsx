import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useLocation, Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
    const { signup } = useAuthContext();
    const [, setLocation] = useLocation();
    const { theme, setTheme, lang, setLang } = useTheme();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "student"
    });
    const [loading, setLoading] = useState(false);
    const [terms, setTerms] = useState(false);

    const t = {
        title: lang === 'en' ? 'Create an Account' : 'اکاؤنٹ بنائیں',
        subtitle: lang === 'en' ? 'Join our learning community' : 'ہماری کمیونٹی میں شامل ہوں',
        firstName: lang === 'en' ? 'First Name' : 'پہلا نام',
        lastName: lang === 'en' ? 'Last Name' : 'آخری نام',
        username: lang === 'en' ? 'Username' : 'یوزر نیم',
        password: lang === 'en' ? 'Password' : 'پاس ورڈ',
        confirm: lang === 'en' ? 'Confirm Password' : 'پاس ورڈ کی تصدیق کریں',
        role: lang === 'en' ? 'I am a...' : 'میں ہوں ایک...',
        terms: lang === 'en' ? 'I agree to terms & conditions' : 'میں شرائط و ضوابط سے اتفاق کرتا ہوں',
        signup: lang === 'en' ? 'Create Account' : 'اکاؤنٹ بنائیں',
        hasAccount: lang === 'en' ? 'Already have an account?' : 'پہلے سے اکاؤنٹ ہے؟',
        login: lang === 'en' ? 'Login' : 'لاگ ان',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!terms) {
            toast({ variant: "destructive", title: "Terms required", description: "Please accept terms and conditions" });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast({ variant: "destructive", title: "Passwords mismatch", description: "Passwords do not match" });
            return;
        }

        setLoading(true);
        try {
            await signup(formData);
            setLocation("/");
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

            <Card className="w-full max-w-lg shadow-2xl border-primary/10">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                    <CardDescription>{t.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t.firstName}</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t.lastName}</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">{t.username}</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">{t.role}</Label>
                            <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="parent">Parent</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">{t.password}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">{t.confirm}</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="terms" checked={terms} onCheckedChange={(c) => setTerms(!!c)} />
                            <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">{t.terms}</Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.signup}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        {t.hasAccount} <Link href="/login"><span className="text-primary hover:underline cursor-pointer">{t.login}</span></Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
