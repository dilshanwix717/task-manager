"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

//entry point simply routes to the right place based on the stored session
export default function Home() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    router.replace(token ? "/tasks" : "/login");
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Loading...
    </div>
  );
}
