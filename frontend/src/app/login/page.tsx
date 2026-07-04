"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GuestRoute from "@/components/routes/GuestRoute";
import LoginForm, { LoginFormValues } from "@/components/forms/LoginForm";
import { loginUser } from "@/api/auth";
import { getApiErrorMessage } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuthFromToken = useAuthStore((state) => state.setAuthFromToken);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const { access_token } = await loginUser(values);
      setAuthFromToken(access_token);
      toast.success("Welcome back!");
      router.replace("/tasks");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GuestRoute>
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md">
          <LoginForm
            onSubmit={handleLogin}
            isSubmitting={isSubmitting}
            serverError={serverError}
          />
        </div>
      </div>
    </GuestRoute>
  );
}
