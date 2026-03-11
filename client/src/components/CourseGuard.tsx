import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserGroups } from "@/hooks/use-resources";
import { useTheme } from "@/hooks/use-theme";
import { Card } from "@/components/ui/card";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface CourseGuardProps {
    children: ReactNode;
    courseName: string;
}

export default function CourseGuard({ children, courseName }: CourseGuardProps) {
    const { user } = useAuth();
    const { data: userGroups, isLoading } = useUserGroups();
    const { lang } = useTheme();
    const [, setLocation] = useLocation();

    // Admins and Teachers always have access
    if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher') {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isEnrolled = userGroups?.some((g: any) =>
        (g.category?.toLowerCase() === courseName.toLowerCase()) ||
        (g.name?.toLowerCase().includes(courseName.toLowerCase()))
    );

    if (!isEnrolled) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-6">
                <Card className="max-w-md w-full p-12 text-center rounded-[3rem] border-none shadow-2xl bg-white relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 to-rose-500" />
                    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                        <Lock className="h-12 w-12 text-rose-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                        {lang === 'en' ? 'Access Restricted' : 'رسائی محدود ہے'}
                    </h2>
                    <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                        {lang === 'en'
                            ? `You are not currently enrolled in the ${courseName} course. Please contact your administrator for enrollment.`
                            : `آپ فی الحال ${courseName} کورس میں شامل نہیں ہیں۔ براہ کرم شمولیت کے لیے اپنے ایڈمنسٹریٹر سے رابطہ کریں۔`}
                    </p>
                    <Button
                        onClick={() => setLocation("/")}
                        className="h-14 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        {lang === 'en' ? 'Back to Dashboard' : 'ڈیش بورڈ پر واپس جائیں'}
                    </Button>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
