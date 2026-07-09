"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ListChecks, LogOut } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ROLES, useAuthStore } from "@/store/useAuthStore";

const NAV = [{ label: "Tasks", href: "/tasks", icon: ListChecks }];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    toast.success("Signed out");
    router.replace("/login");
  };

  const isAdmin = user?.role === ROLES.admin;
  const initial = user?.userName?.charAt(0).toUpperCase() ?? "?";

  return (
    <aside className="flex h-full w-59 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 py-6 font-bold text-foreground">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          T
        </span>
        Tasktide
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* account footer */}
      {user && (
        <div className="m-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-tint text-sm font-bold text-primary-hover">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.userName}
              </p>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  isAdmin
                    ? "bg-primary-tint text-primary-hover"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                {user.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-status-overdue-bg hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
