"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BookOpen,
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Repeat,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
  UserCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/thunks/auth.thunks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/packs", label: "Packs", icon: Boxes },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/leads", label: "Leads", icon: Sparkles },
  { href: "/subscribers", label: "Subscribers", icon: Mail },
  { href: "/onboarding", label: "Onboarding", icon: UserCheck },
  { href: "/users", label: "Users", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [search, setSearch] = useState("");

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace("/login");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <div className="bg-muted/30 flex min-h-screen">
      {/* Sidebar */}
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-64 shrink-0 flex-col border-r md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-sm font-bold">
            O
          </span>
          <span className="font-bold tracking-tight">OrbitKit</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background flex h-14 items-center justify-between gap-3 border-b px-4 md:px-6">
          <span className="text-sm font-semibold md:hidden">OrbitKit</span>
          <form onSubmit={handleSearch} className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search packs, posts, orders…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <span className="text-muted-foreground hidden text-sm sm:inline">
                {user.name || user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
