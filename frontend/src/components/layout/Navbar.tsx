"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROLES, useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

// Compact top bar shown on small screens (the sidebar collapses away there).
const Navbar = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    toast.success("Signed out");
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            T
          </span>
          Tasktide
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                user.role === ROLES.admin
                  ? "bg-primary-tint text-primary-hover"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {user.role}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
