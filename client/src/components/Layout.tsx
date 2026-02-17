import { ReactNode } from "react";
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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme, lang, setLang } = useTheme();

  const navigation = [
    { name: lang === 'en' ? 'Dashboard' : 'ڈیش بورڈ', href: '/', icon: LayoutDashboard },
    { name: lang === 'en' ? 'Darse Nizami' : 'درس نظامی', href: '/books', icon: Book },
    { name: lang === 'en' ? 'Quran & Tajweed' : 'قرآن و تجوید', href: '/quran', icon: BookOpen },
    { name: lang === 'en' ? 'Live Classes' : 'لائیو کلاسز', href: '/live', icon: Video },
    { name: lang === 'en' ? 'AI Tutor' : 'اے آئی ٹیوٹر', href: '/tutor', icon: MessagesSquare },
    { name: lang === 'en' ? 'Quizzes' : 'کوئز', href: '/quizzes', icon: GraduationCap },
    { name: lang === 'en' ? 'Achievements' : 'کامیابیاں', href: '/achievements', icon: Trophy },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/25">
            M
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none text-foreground tracking-tight">Madrasa</h1>
            <p className="text-xs text-muted-foreground mt-1">Online Education</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
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
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full hover:bg-muted"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
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
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
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
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="shadow-lg bg-card border-primary/20">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r border-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ltr:pl-64 md:rtl:pr-64 w-full min-h-screen transition-all duration-300">
        <div className="container max-w-7xl mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
