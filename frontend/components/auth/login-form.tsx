"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { AuthCard, FormAlert } from "./auth-card";
import { PasswordInput } from "./password-input";
import { useAuth } from "@/context/auth-context";
import { toApiError } from "@/services/api";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { DASHBOARD_HOME } from "@/constants/navigation";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/constants/site";
import { USE_MOCK } from "@/lib/config";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const expired = params.get("reason") === "expired";

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.replace(DASHBOARD_HOME[user.role]);
    } catch (e) {
      const err = toApiError(e);
      setServerError(err.status === 401 ? "Invalid email or password. Please try again." : err.message);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to continue to your dashboard."
      footer={<>New to the platform? <Link href="/register" className="font-medium text-primary hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {expired && <FormAlert tone="info" message="Your session has expired. Please log in again." />}
        <FormAlert message={serverError} />
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" placeholder="Your password" aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} {isSubmitting ? "Signing in…" : "Log in"}
        </Button>
      </form>

      {USE_MOCK && (
        <div className="mt-6 rounded-lg border border-dashed bg-secondary/50 p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Demo accounts</p>
          <p className="mt-1 text-xs text-muted-foreground">Password for all: <code className="rounded bg-card px-1 py-0.5">{DEMO_PASSWORD}</code></p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button key={a.role} type="button" variant="outline" size="sm" onClick={() => { setValue("email", a.email, { shouldValidate: true }); setValue("password", DEMO_PASSWORD, { shouldValidate: true }); }}>
                Fill {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </AuthCard>
  );
}
