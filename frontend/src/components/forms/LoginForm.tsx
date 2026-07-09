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

// Schema
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isSubmitting,
  serverError,
}) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const { handleSubmit } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to pick up where you left off.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="Enter your password"
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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      {/* demo credentials — shown intentionally so reviewers can sign in */}
      <div className="mt-6 rounded-lg border border-border bg-primary-tint px-4 py-3 text-sm text-primary-hover">
        <p className="font-semibold">Demo admin account</p>
        <p className="mt-1 font-mono text-[13px]">admin@tasktracker.dev</p>
        <p className="font-mono text-[13px]">admin123</p>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginForm;
