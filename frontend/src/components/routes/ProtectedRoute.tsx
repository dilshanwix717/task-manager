"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHydrated } from "@/hooks/useHydrated";

//client side guard, the token lives in localStorage so the server can never know it
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  //wait for the persisted store to rehydrate before deciding anything
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
