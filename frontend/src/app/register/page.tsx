"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import GuestRoute from "@/components/routes/GuestRoute";
import RegisterForm, {
  RegisterFormValues,
} from "@/components/forms/RegisterForm";
import { registerUser } from "@/api/auth";
import { getApiErrorMessage } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuthFromToken = useAuthStore((state) => state.setAuthFromToken);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleRegister = async ({
    userName,
    email,
    password,
  }: RegisterFormValues) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const { access_token } = await registerUser({
        userName,
        email,
        password,
      });
      setAuthFromToken(access_token);
      toast.success("Account created, welcome!");
      router.replace("/tasks");
    } catch (error) {
      setServerError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GuestRoute>
      <RegisterForm
        onSubmit={handleRegister}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />
    </GuestRoute>
  );
}
