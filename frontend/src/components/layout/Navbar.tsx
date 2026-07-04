"use client";

import { useRouter } from "next/navigation";
import { LogOut, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES, useAuthStore } from "@/store/useAuthStore";

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
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold">
          <ListChecks className="h-5 w-5" />
          Task Tracker
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm text-muted-foreground">
                {user.userName}
              </span>
              <Badge
                variant={user.role === ROLES.admin ? "default" : "secondary"}
              >
                {user.role}
              </Badge>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
