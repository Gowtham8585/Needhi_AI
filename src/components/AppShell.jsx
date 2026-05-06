import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Scale, LayoutDashboard, Upload, MessageCircle, Sun, Moon, LogOut, User, Settings, Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Chatbot", icon: MessageCircle },
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppShell({ children }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-aurora border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-aurora flex items-center justify-center shadow-[var(--shadow-glow)]">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[oklch(0.15_0.04_270)]" />
              </div>
              <span className="font-semibold tracking-tight text-base sm:text-lg">
                Needhi<span className="text-aurora">_</span>AI
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition",
                    active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <n.icon className="w-4 h-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="hidden sm:flex" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors focus:outline-none">
                  <Avatar className="h-8 w-8 border border-border/50">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-aurora text-[oklch(0.15_0.04_270)] font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-strong border-border/50 mt-2" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild className="focus:bg-accent cursor-pointer">
                  <Link to="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-accent cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={() => signOut().then(() => navigate({ to: "/" }))}
                  className="focus:bg-red-400/10 text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={cn(
        "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all md:hidden",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={() => setMobileMenuOpen(false)}>
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 glass-strong border-r border-border/50 p-6 transition-transform duration-300",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-aurora" />
                <span className="font-bold">Needhi_AI</span>
              </div>
              <ThemeToggle />
            </div>
            <nav className="flex-1 space-y-2">
              {nav.map((n) => {
                const active = path.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition",
                      active ? "bg-aurora text-[oklch(0.15_0.04_270)] font-bold shadow-[var(--shadow-glow)]" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <n.icon className="w-5 h-5" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
            <footer className="mt-auto pt-6 border-t border-border/50 text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Government Grade Security
            </footer>
          </div>
        </aside>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        Securely stored in your account · End-to-end encrypted analyzer
      </footer>
    </div>
  );
}
