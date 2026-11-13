"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { ImagePicker } from "@/components/common/image-picker";
import { CardSkeleton } from "@/components/common/skeletons";
import { useAsync } from "@/hooks/use-async";
import { recruiterService } from "@/services/recruiter.service";
import { toApiError } from "@/services/api";
import { companySchema, type CompanyValues } from "@/lib/validation";
import type { CompanyProfile } from "@/types/recruiter";

function Editor({ initial }: { initial: CompanyProfile }) {
  const [logo, setLogo] = useState(initial.logoUrl);
  const toForm = (c: CompanyProfile): CompanyValues => ({ name: c.name, description: c.description, website: c.website ?? "", location: c.location ?? "", industry: c.industry ?? "" });
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting, isDirty } } = useForm<CompanyValues>({ resolver: zodResolver(companySchema), defaultValues: toForm(initial) });

  const companyName = useWatch({ control, name: "name" });

  const onSubmit = async (v: CompanyValues) => {
    try {
      const saved = await recruiterService.updateCompany(v);
      reset(toForm(saved));
      toast.success("Company profile saved");
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  const saveLogo = async (url: string) => {
    setLogo(url);
    await recruiterService.updateCompany({ logoUrl: url }).catch((e) => toast.error(toApiError(e).message));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-6">
      <Card>
        <CardHeader><CardTitle>Company logo</CardTitle><CardDescription>Shown on your job postings.</CardDescription></CardHeader>
        <CardContent><ImagePicker name={companyName || "Company"} src={logo} rounded={false} label="Change logo" upload={(f) => recruiterService.uploadLogo(f)} onUploaded={saveLogo} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Company information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label="Company name" required error={errors.name?.message}><Input id="name" {...register("name")} /></FormField>
          <FormField id="industry" label="Industry" error={errors.industry?.message}><Input id="industry" placeholder="e.g. Software / SaaS" {...register("industry")} /></FormField>
          <FormField id="website" label="Website" error={errors.website?.message}><Input id="website" placeholder="https://example.com" {...register("website")} /></FormField>
          <FormField id="location" label="Location" required error={errors.location?.message}><Input id="location" placeholder="City, Country" {...register("location")} /></FormField>
          <FormField id="description" label="About the company" required className="sm:col-span-2" error={errors.description?.message}><Textarea id="description" rows={5} {...register("description")} /></FormField>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || !isDirty}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save company profile</Button></div>
    </form>
  );
}

export function CompanyProfileView() {
  const { data, error, initialLoading, reload } = useAsync(() => recruiterService.getCompany(), []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <div className="max-w-3xl space-y-4"><CardSkeleton lines={2} /><CardSkeleton lines={6} /></div>;
  return <Editor key={data.id} initial={data} />;
}
