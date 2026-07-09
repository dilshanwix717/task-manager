import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import AuthLayout from "./AuthLayout";

// Schema, mirrors the backend RegisterUserDto rules
const registerSchema = z
  .object({
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Only letters, numbers, dots, underscores and hyphens",
      ),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isSubmitting,
  serverError,
}) => {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start tracking your tasks in a calmer way.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.username"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      disabled={isSubmitting}
                      className="pr-11"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {serverError && (
            <div className="rounded-lg border border-destructive/30 bg-status-overdue-bg px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterForm;
