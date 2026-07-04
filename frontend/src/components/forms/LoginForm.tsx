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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Task Tracker
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to manage your tasks
        </CardDescription>
      </CardHeader>

      <CardContent>
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
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {serverError}
              </div>
            )}

            <div className="py-2 text-sm text-blue-500 bg-blue-50 p-2 rounded">
              <strong>Demo Admin:</strong>
              <div>admin@tasktracker.dev / admin123</div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              No account yet?{" "}
              <Link href="/register" className="text-primary underline">
                Register
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
