"use client";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { CardSkeleton } from "@/components/common/skeletons";
import { TagInput } from "@/components/common/tag-input";
import { useAsync } from "@/hooks/use-async";
import { jobService } from "@/services/job.service";
import { toApiError } from "@/services/api";
import { jobSchema, type JobValues } from "@/lib/validation";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/constants/job";
import type { Job, JobFormValues } from "@/types/job";

const toForm = (j?: Job): JobValues => ({
  title: j?.title ?? "", description: j?.description ?? "", requiredSkills: j?.requiredSkills ?? [], preferredSkills: j?.preferredSkills ?? [],
  experienceLevel: j?.experienceLevel ?? "FRESHER", experienceRequired: j?.experienceRequired ?? "", educationRequirements: j?.educationRequirements ?? "",
  location: j?.location ?? "", salaryMin: j?.salaryMin ? String(j.salaryMin) : "", salaryMax: j?.salaryMax ? String(j.salaryMax) : "",
  employmentType: j?.employmentType ?? "FULL_TIME", openings: j ? String(j.openings) : "1", deadline: j ? j.deadline.slice(0, 10) : "",
});

const toPayload = (v: JobValues): JobFormValues => ({
  ...v,
  salaryMin: v.salaryMin ? Number(v.salaryMin) : null,
  salaryMax: v.salaryMax ? Number(v.salaryMax) : null,
  openings: Number(v.openings),
  deadline: new Date(`${v.deadline}T23:59:00`).toISOString(),
});

function JobFormInner({ job }: { job?: Job }) {
  const router = useRouter();
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<JobValues>({ resolver: zodResolver(jobSchema), defaultValues: toForm(job) });

  const onSubmit = async (v: JobValues) => {
    try {
      if (job) await jobService.update(job.id, toPayload(v));
      else await jobService.create(toPayload(v));
      toast.success(job ? "Job updated" : "Job published");
      router.push("/recruiter/jobs");
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-4xl space-y-6">
      <Card>
        <CardHeader><CardTitle>Job details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="title" label="Job title" required className="sm:col-span-2" error={errors.title?.message}><Input id="title" placeholder="e.g. Backend Developer" {...register("title")} /></FormField>
          <FormField id="description" label="Job description" required className="sm:col-span-2" error={errors.description?.message}><Textarea id="description" rows={7} placeholder="Responsibilities, team, what success looks like…" {...register("description")} /></FormField>
          <FormField id="employmentType" label="Employment type" required error={errors.employmentType?.message}>
            <Controller control={control} name="employmentType" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="employmentType"><SelectValue /></SelectTrigger><SelectContent>{EMPLOYMENT_TYPES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
            )} />
          </FormField>
          <FormField id="location" label="Location" required error={errors.location?.message}><Input id="location" placeholder="City or Remote" {...register("location")} /></FormField>
          <FormField id="openings" label="Number of openings" required error={errors.openings?.message}><Input id="openings" inputMode="numeric" {...register("openings")} /></FormField>
          <FormField id="deadline" label="Application deadline" required error={errors.deadline?.message}><Input id="deadline" type="date" {...register("deadline")} /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="requiredSkills" label="Required skills" required className="sm:col-span-2" error={errors.requiredSkills?.message}>
            <Controller control={control} name="requiredSkills" render={({ field }) => <TagInput id="requiredSkills" value={field.value} onChange={field.onChange} invalid={!!errors.requiredSkills} />} />
          </FormField>
          <FormField id="preferredSkills" label="Preferred skills" className="sm:col-span-2" hint="Nice-to-have skills">
            <Controller control={control} name="preferredSkills" render={({ field }) => <TagInput id="preferredSkills" value={field.value} onChange={field.onChange} />} />
          </FormField>
          <FormField id="experienceLevel" label="Experience level" required error={errors.experienceLevel?.message}>
            <Controller control={control} name="experienceLevel" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="experienceLevel"><SelectValue /></SelectTrigger><SelectContent>{EXPERIENCE_LEVELS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
            )} />
          </FormField>
          <FormField id="experienceRequired" label="Experience required" required error={errors.experienceRequired?.message}><Input id="experienceRequired" placeholder="e.g. 1–3 years" {...register("experienceRequired")} /></FormField>
          <FormField id="educationRequirements" label="Education requirements" required className="sm:col-span-2" error={errors.educationRequirements?.message}><Input id="educationRequirements" placeholder="e.g. B.Tech / B.E. in CSE or related field" {...register("educationRequirements")} /></FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Salary (optional)</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="salaryMin" label="Minimum (₹ per year)" error={errors.salaryMin?.message}><Input id="salaryMin" inputMode="numeric" placeholder="600000" {...register("salaryMin")} /></FormField>
          <FormField id="salaryMax" label="Maximum (₹ per year)" error={errors.salaryMax?.message}><Input id="salaryMax" inputMode="numeric" placeholder="1000000" {...register("salaryMax")} /></FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/recruiter/jobs")} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} {job ? "Save changes" : "Publish job"}</Button>
      </div>
    </form>
  );
}

export function JobForm({ jobId }: { jobId?: string }) {
  const { data, error, initialLoading, reload } = useAsync(() => (jobId ? jobService.get(jobId) : Promise.resolve(undefined)), [jobId]);
  if (!jobId) return <JobFormInner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <div className="max-w-4xl space-y-4"><CardSkeleton lines={5} /><CardSkeleton lines={4} /></div>;
  return <JobFormInner key={data.id} job={data} />;
}
