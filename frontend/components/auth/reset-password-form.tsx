"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/common/form-field";
import { AuthCard, FormAlert } from "./auth-card";
import { PasswordInput } from "./password-input";
import { authService } from "@/services/auth.service";
import { toApiError } from "@/services/api";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation";
import { USE_MOCK } from "@/lib/config";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirmPassword: "" } });

  if (!token) {
    return (
      <AuthCard title="Invalid reset link" description="This password reset link is missing or malformed. Request a new one to continue.">
        <Button asChild><Link href="/forgot-password">Request a new link</Link></Button>
        {USE_MOCK && <p className="mt-4 text-xs text-muted-foreground">Demo: open <code className="rounded bg-secondary px-1">/reset-password?token=demo</code> to try the form (use <code className="rounded bg-secondary px-1">token=expired</code> to see the expired state).</p>}
      </AuthCard>
    );
  }

  const onSubmit = async (v: ResetPasswordValues) => {
    setServerError(null);
    try {
      await authService.resetPassword({ token, password: v.password });
      toast.success("Password updated. You can now log in.");
      router.replace("/login");
    } catch (e) {
      setServerError(toApiError(e).message);
    }
  };

  return (
    <AuthCard title="Set a new password" description="Choose a strong password you haven't used before.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormAlert message={serverError} />
        {serverError && <p className="text-sm"><Link href="/forgot-password" className="font-medium text-primary hover:underline">Request a new reset link</Link></p>}
        <FormField id="password" label="New password" error={errors.password?.message} hint="At least 8 characters with upper, lower case and a number.">
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
        <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        </FormField>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Update password
        </Button>
      </form>
    </AuthCard>
  );
}
