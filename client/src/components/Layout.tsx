import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import {
  LayoutDashboard,
  BookOpen,
  Book,
  Video,
  MessagesSquare,
  GraduationCap,
  Trophy,
  Menu,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  Globe,
  Library,
  Layers,
  FileQuestion,
  Activity,
  Flame,
  ClipboardList,
  BarChart3,
  Banknote,
  Users,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import logoImg from "@/assets/images/logo-transparent.png";

export default function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme, lang, setLang } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: lang === 'en' ? 'Dashboard' : 'ڈیش بورڈ', href: '/dashboard', icon: LayoutDashboard },
    { name: lang === 'en' ? 'Darse Nizami' : 'درس نظامی', href: '/books', icon: Book },
    { name: lang === 'en' ? 'Basics Library' : 'لائبریری', href: '/library', icon: Library },
    { name: lang === 'en' ? 'Quran & Tajweed' : 'قرآن و تجوید', href: '/quran', icon: BookOpen },
    { name: lang === 'en' ? 'Communication' : 'رابطہ', href: '/communication', icon: MessagesSquare },
    { name: lang === 'en' ? 'User Management' : 'صارفین کا انتظام', href: '/user-management', icon: Users, roles: ['admin'] },
    { name: lang === 'en' ? 'Attendance' : 'حاضری', href: '/attendance', icon: ClipboardList, roles: ['teacher', 'admin', 'student'] },
    { name: lang === 'en' ? 'Live Classes' : 'لائیو کلاسز', href: '/live', icon: Video },
    { name: lang === 'en' ? 'AI Tutor' : 'اے آئی ٹیوٹر', href: '/tutor', icon: MessagesSquare },
    { name: lang === 'en' ? 'Quizzes' : 'کوئز', href: '/quizzes', icon: GraduationCap },
    { name: lang === 'en' ? 'Achievements' : 'کامیابیاں', href: '/achievements', icon: Trophy },
    { name: lang === 'en' ? 'Recorded Classes' : 'ریکارڈ شدہ کلاسیں', href: '/recorded-classes', icon: Video },
    { name: lang === 'en' ? 'Flashcards' : 'فلیش کارڈز', href: '/flashcards', icon: Layers },
    { name: lang === 'en' ? 'Salaah Tracker' : 'نماز ٹریکر', href: '/salaah-tracker', icon: Activity },
    { name: lang === 'en' ? 'Leaderboard' : 'لیڈر بورڈ', href: '/leaderboard', icon: Trophy },
    { name: lang === 'en' ? 'Progress Reports' : 'پراگریس رپورٹ', href: '/progress-reports', icon: BarChart3, roles: ['parent', 'admin'] },
    { name: lang === 'en' ? 'Fees' : 'فیس', href: '/fees', icon: Banknote, roles: ['admin', 'parent'] },
    { name: lang === 'en' ? 'Namaz Course' : 'نماز کورس', href: '/salah-course', icon: GraduationCap },
    { name: lang === 'en' ? 'Tafseer Course' : 'تفسیرِ قرآن', href: '/tafseer-course', icon: BookOpen },
    { name: lang === 'en' ? 'Tajweed Course' : 'تجوید کورس', href: '/tajweed-course', icon: Book },
    { name: lang === 'en' ? 'Hadees Course' : 'حدیث کورس', href: '/hadees-course', icon: BookOpen },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role.toLowerCase());
  });

  const renderSidebar = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* ── Branded Header ── */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="bg-gradient-to-br from-emerald-800 via-green-800 to-teal-900 px-4 py-4">
          {/* Decorative orbs */}
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/5" />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center gap-3">
            {/* Logo image — Cleanly merged with transparency and a soft halo for dark background visibility */}
            <div className="relative group transition-transform hover:scale-110 duration-500 w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-1 bg-white/90 blur-[16px] rounded-full opacity-100 scale-150" />
              <img
                src={logoImg}
                alt="Saut-ul-Quran"
                className="w-16 h-16 object-contain relative z-10"
              />
            </div>

            {/* Text */}
            <div>
              <h1 className="font-bold text-lg text-white leading-tight tracking-wide">
                Saut-ul-Quran
              </h1>
              <p className="text-[10px] text-white/80 font-medium uppercase tracking-widest mt-1">
                Knowledge & Wisdom
              </p>
            </div>
          </div>
        </div>
      </div>


      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = location === item.href;
          return (
            <div
              key={item.name}
              onClick={() => {
                if (isMobile) {
                  setIsMobileMenuOpen(false); // Trigger Radix hide immediately
                  setTimeout(() => {
                    setLocation(item.href); // Navigate after animation begins
                  }, 250);
                } else {
                  setLocation(item.href);
                }
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false);
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className="rounded-full hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobile) setIsMobileMenuOpen(false);
              setLang(lang === 'en' ? 'ur' : 'en');
            }}
            className="rounded-full hover:bg-muted font-bold"
          >
            {lang === 'en' ? 'اردو' : 'EN'}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.firstName?.[0] || <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.firstName || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => { if (isMobile) setIsMobileMenuOpen(false); logout(); }} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-50">
        {renderSidebar(false)}
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="shadow-lg bg-card border-primary/20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r border-border">
            {renderSidebar(true)}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ltr:pl-64 md:rtl:pr-64 w-full min-h-screen transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-islamic-subtle pointer-events-none" />
        <div className="container max-w-7xl mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
