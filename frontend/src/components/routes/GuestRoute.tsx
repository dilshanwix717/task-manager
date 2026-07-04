"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHydrated } from "@/hooks/useHydrated";

//keeps already signed in users away from the login and register pages
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/tasks");
    }
  }, [hydrated, token, router]);

  if (!hydrated || token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
};

export default GuestRoute;
