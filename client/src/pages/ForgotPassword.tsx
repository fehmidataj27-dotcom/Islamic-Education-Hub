import { useState } from "react";
import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Globe, Moon, Sun } from "lucide-react";

export default function ForgotPassword() {
    const { theme, setTheme, lang, setLang } = useTheme();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const t = {
        title: lang === 'en' ? 'Reset Password' : 'پاس ورڈ ری سیٹ کریں',
        subtitle: lang === 'en' ? 'Enter your email to receive reset link' : 'ری سیٹ لنک حاصل کرنے کے لیے اپنا ای میل درج کریں',
        email: lang === 'en' ? 'Email' : 'ای میل',
        send: lang === 'en' ? 'Send Reset Link' : 'ری سیٹ لنک بھیجیں',
        back: lang === 'en' ? 'Back to Login' : 'واپس لاگ ان پر جائیں',
        successTitle: lang === 'en' ? 'Link Sent!' : 'لنک بھیج دیا گیا!',
        successDesc: lang === 'en' ? `Check ${email} for password reset instructions.` : `پاس ورڈ ری سیٹ کرنے کی ہدایات کے لیے ${email} چیک کریں۔`,
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
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
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
                    <CardDescription>{!submitted ? t.subtitle : ""}</CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">{t.email}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                {t.send}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-bold text-xl">{t.successTitle}</h3>
                            <p className="text-muted-foreground">{t.successDesc}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/login">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            {t.back}
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
