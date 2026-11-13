"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/common/form-field";
import { ImagePicker } from "@/components/common/image-picker";
import { TagInput } from "@/components/common/tag-input";
import { CertificationsSection, ExperienceSection, ProjectsSection } from "./profile-sections";
import { candidateService } from "@/services/candidate.service";
import { toApiError } from "@/services/api";
import { useAuth } from "@/context/auth-context";
import { calcProfileCompletion } from "@/lib/profile";
import { profileSchema, type ProfileValues } from "@/lib/validation";
import type { CandidateProfile } from "@/types/candidate";

export function ProfileEditor({ initial, hasResume }: { initial: CandidateProfile; hasResume: boolean }) {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(initial);
  const [skills, setSkills] = useState(initial.skills);
  const [savingSkills, setSavingSkills] = useState(false);
  const completion = calcProfileCompletion({ ...profile, skills }, hasResume);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toForm(initial),
  });

  const patch = async (change: Partial<CandidateProfile>, message = "Profile updated") => {
    try {
      const saved = await candidateService.updateProfile(change);
      setProfile(saved);
      toast.success(message);
      return saved;
    } catch (e) {
      toast.error(toApiError(e).message);
      throw e;
    }
  };

  const onSubmit = async (v: ProfileValues) => {
    const saved = await patch({ ...v, graduationYear: v.graduationYear ? Number(v.graduationYear) : undefined }).catch(() => null);
    if (saved) {
      reset(toForm(saved));
      updateUser({ name: saved.fullName });
    }
  };

  const saveSkills = async () => {
    setSavingSkills(true);
    await patch({ skills }, "Skills updated").catch(() => undefined);
    setSavingSkills(false);
  };

  const uploadAvatar = async (url: string) => {
    setProfile((p) => ({ ...p, avatarUrl: url }));
    await candidateService.updateProfile({ avatarUrl: url }).catch(() => undefined);
    updateUser({ avatarUrl: url });
  };

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <ImagePicker name={profile.fullName} src={profile.avatarUrl} upload={(f) => candidateService.uploadAvatar(f)} onUploaded={uploadAvatar} />
        <div className="w-full sm:max-w-xs">
          <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">Profile completion</span><span className="font-semibold tabular-nums">{completion}%</span></div>
          <Progress value={completion} aria-label="Profile completion" />
          <p className="mt-1.5 text-xs text-muted-foreground">A complete profile helps recruiters and improves recommendations.</p>
        </div>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="personal">Personal &amp; education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="projects">Projects &amp; certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <FormField id="fullName" label="Full name" required error={errors.fullName?.message}><Input id="fullName" {...register("fullName")} /></FormField>
                <FormField id="email" label="Email" required error={errors.email?.message}><Input id="email" type="email" {...register("email")} /></FormField>
                <FormField id="phone" label="Phone number" error={errors.phone?.message}><Input id="phone" type="tel" placeholder="+91 98765 43210" {...register("phone")} /></FormField>
                <FormField id="location" label="Location" error={errors.location?.message}><Input id="location" placeholder="City, State" {...register("location")} /></FormField>
                <FormField id="headline" label="Headline" className="sm:col-span-2" error={errors.headline?.message}><Input id="headline" placeholder="e.g. B.Tech CSE · Full-stack developer" {...register("headline")} /></FormField>
                <FormField id="summary" label="Summary" className="sm:col-span-2" error={errors.summary?.message}><Textarea id="summary" rows={3} {...register("summary")} /></FormField>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Education</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <FormField id="college" label="College / university" error={errors.college?.message}><Input id="college" {...register("college")} /></FormField>
                <FormField id="degree" label="Degree" error={errors.degree?.message}><Input id="degree" placeholder="B.Tech Computer Science" {...register("degree")} /></FormField>
                <FormField id="graduationYear" label="Graduation year" error={errors.graduationYear?.message}><Input id="graduationYear" inputMode="numeric" placeholder="2026" {...register("graduationYear")} /></FormField>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Links</CardTitle><CardDescription>Optional, but recruiters love a portfolio.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <FormField id="linkedinUrl" label="LinkedIn" error={errors.linkedinUrl?.message}><Input id="linkedinUrl" placeholder="https://linkedin.com/in/…" {...register("linkedinUrl")} /></FormField>
                <FormField id="githubUrl" label="GitHub" error={errors.githubUrl?.message}><Input id="githubUrl" placeholder="https://github.com/…" {...register("githubUrl")} /></FormField>
                <FormField id="portfolioUrl" label="Portfolio" error={errors.portfolioUrl?.message}><Input id="portfolioUrl" placeholder="https://…" {...register("portfolioUrl")} /></FormField>
              </CardContent>
            </Card>
            <div className="flex items-center justify-end gap-3">
              {isDirty && <span className="text-sm text-muted-foreground">You have unsaved changes</span>}
              <Button type="submit" disabled={isSubmitting || !isDirty}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save changes</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader><CardTitle>Skills</CardTitle><CardDescription>Add the technologies and tools you work with.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <TagInput id="skills" value={skills} onChange={setSkills} />
              <Button onClick={saveSkills} disabled={savingSkills || JSON.stringify(skills) === JSON.stringify(profile.skills)}>{savingSkills ? <Loader2 className="animate-spin" /> : <Save />} Save skills</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <ExperienceSection items={profile.experience} onChange={(experience) => patch({ experience }, "Experience updated").then(() => undefined)} />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsSection items={profile.projects} onChange={(projects) => patch({ projects }, "Projects updated").then(() => undefined)} />
          <CertificationsSection items={profile.certifications} onChange={(certifications) => patch({ certifications }, "Certifications updated").then(() => undefined)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function toForm(p: CandidateProfile): ProfileValues {
  return {
    fullName: p.fullName, email: p.email, phone: p.phone ?? "", location: p.location ?? "", headline: p.headline ?? "", summary: p.summary ?? "",
    college: p.college ?? "", degree: p.degree ?? "", graduationYear: p.graduationYear ? String(p.graduationYear) : "",
    linkedinUrl: p.linkedinUrl ?? "", githubUrl: p.githubUrl ?? "", portfolioUrl: p.portfolioUrl ?? "",
  };
}
