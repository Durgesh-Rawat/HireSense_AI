"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common/form-field";
import { AuthCard, FormAlert } from "./auth-card";
import { PasswordInput } from "./password-input";
import { useAuth } from "@/context/auth-context";
import { toApiError } from "@/services/api";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { DASHBOARD_HOME } from "@/constants/navigation";

type SignupRole = "CANDIDATE" | "RECRUITER";

export function RegisterForm({ role }: { role: SignupRole }) {
  const { register: signup } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isRecruiter = role === "RECRUITER";

  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", companyName: "", password: "", confirmPassword: "", terms: false },
  });

  const onSubmit = async (v: RegisterValues) => {
    setServerError(null);
    if (isRecruiter && !v.companyName?.trim()) {
      setError("companyName", { message: "Company name is required" });
      return;
    }
    try {
      const user = await signup({ name: v.name, email: v.email, password: v.password, role, companyName: isRecruiter ? v.companyName : undefined });
      toast.success("Account created. Welcome aboard!");
      router.replace(DASHBOARD_HOME[user.role]);
    } catch (e) {
      const err = toApiError(e);
      if (err.fieldErrors?.email) setError("email", { message: err.fieldErrors.email });
      setServerError(err.message);
    }
  };

  return (
    <AuthCard
      title={isRecruiter ? "Create a recruiter account" : "Create your candidate account"}
      description={isRecruiter ? "Post jobs and find the best-matched candidates." : "Upload your resume and apply to jobs in a click."}
      footer={
        <div className="space-y-1">
          <p>Already registered? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link></p>
          <p>
            {isRecruiter ? "Looking for a job instead? " : "Hiring instead? "}
            <Link href={isRecruiter ? "/register/candidate" : "/register/recruiter"} className="font-medium text-primary hover:underline">
              Register as a {isRecruiter ? "candidate" : "recruiter"}
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormAlert message={serverError} />
        <FormField id="name" label="Full name" required error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Aarav Sharma" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField id="email" label="Email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        {isRecruiter && (
          <FormField id="companyName" label="Company name" required error={errors.companyName?.message}>
            <Input id="companyName" autoComplete="organization" placeholder="Acme Technologies" aria-invalid={!!errors.companyName} {...register("companyName")} />
          </FormField>
        )}
        <FormField id="password" label="Password" required error={errors.password?.message} hint="At least 8 characters with upper, lower case and a number.">
          <PasswordInput id="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
        <FormField id="confirmPassword" label="Confirm password" required error={errors.confirmPassword?.message}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        </FormField>
        <div>
          <div className="flex items-start gap-2">
            <Controller control={control} name="terms" render={({ field }) => (
              <Checkbox id="terms" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
            )} />
            <label htmlFor="terms" className="text-sm text-muted-foreground">I agree to the Terms of Service and Privacy Policy.</label>
          </div>
          {errors.terms && <p role="alert" className="mt-1 text-xs font-medium text-destructive">{errors.terms.message}</p>}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
