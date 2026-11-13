"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { AuthCard, FormAlert } from "./auth-card";
import { authService } from "@/services/auth.service";
import { toApiError } from "@/services/api";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const onSubmit = async (v: ForgotPasswordValues) => {
    setServerError(null);
    try {
      await authService.forgotPassword(v);
      setSentTo(v.email);
    } catch (e) {
      setServerError(toApiError(e).message);
    }
  };

  if (sentTo) {
    return (
      <AuthCard title="Check your email" description={`If an account exists for ${sentTo}, we've sent a link to reset your password.`}>
        <div className="flex flex-col items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><MailCheck className="size-6" /></span>
          <Button asChild variant="outline"><Link href="/login"><ArrowLeft /> Back to log in</Link></Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Forgot your password?" description="Enter your email and we'll send you a reset link." footer={<Link href="/login" className="font-medium text-primary hover:underline">Back to log in</Link>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormAlert message={serverError} />
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Send reset link
        </Button>
      </form>
    </AuthCard>
  );
}
