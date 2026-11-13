"use client";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Briefcase, FolderGit2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { FormField } from "@/components/common/form-field";
import { SkillChips } from "@/components/common/skill-chips";
import { certificationSchema, experienceSchema, projectSchema, type CertificationValues, type ExperienceValues, type ProjectValues } from "@/lib/validation";
import { formatDate } from "@/lib/utils";
import { nextLocalId } from "@/lib/ids";
import type { Certification, Project, WorkExperience } from "@/types/candidate";

/* Generic shell: header + list + add button + confirm-delete. */
function Section<T extends { id: string }>({
  title, icon: Icon, items, emptyText, onAdd, onEdit, onDelete, render,
}: {
  title: string; icon: typeof Briefcase; items: T[]; emptyText: string;
  onAdd: () => void; onEdit: (item: T) => void; onDelete: (item: T) => void; render: (item: T) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Icon className="size-4.5 text-primary" />{title}</CardTitle>
        <Button size="sm" variant="outline" onClick={onAdd}><Plus /> Add</Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={Icon} title={emptyText} />
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">{render(item)}</div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(item)}><Pencil /></Button>
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => onDelete(item)}><Trash2 className="text-destructive" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function FormDialog({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; children: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function SubmitRow({ busy, onCancel }: { busy: boolean; onCancel: () => void }) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Save</Button>
    </DialogFooter>
  );
}

/* ---------------- Experience ---------------- */
export function ExperienceSection({ items, onChange }: { items: WorkExperience[]; onChange: (next: WorkExperience[]) => Promise<void> }) {
  const [editing, setEditing] = useState<WorkExperience | "new" | null>(null);
  const [removing, setRemoving] = useState<WorkExperience | null>(null);
  const form = useForm<ExperienceValues>({ resolver: zodResolver(experienceSchema) });
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = form;
  const current = useWatch({ control, name: "current" });

  const open = (item: WorkExperience | "new") => {
    reset(item === "new" ? { title: "", company: "", startDate: "", endDate: "", current: false, description: "" } : { title: item.title, company: item.company, startDate: item.startDate, endDate: item.endDate ?? "", current: item.current ?? !item.endDate, description: item.description ?? "" });
    setEditing(item);
  };
  const save = async (v: ExperienceValues) => {
    const entry: WorkExperience = { id: editing && editing !== "new" ? editing.id : nextLocalId("exp"), title: v.title, company: v.company, startDate: v.startDate, endDate: v.current ? null : v.endDate || null, current: v.current, description: v.description };
    await onChange(editing === "new" ? [entry, ...items] : items.map((i) => (i.id === entry.id ? entry : i)));
    setEditing(null);
  };

  return (
    <>
      <Section title="Work experience" icon={Briefcase} items={items} emptyText="No work experience added yet" onAdd={() => open("new")} onEdit={open} onDelete={setRemoving}
        render={(e) => (<><p className="font-medium">{e.title}</p><p className="text-sm text-muted-foreground">{e.company} · {formatDate(e.startDate, { month: "short", year: "numeric" })} – {e.current || !e.endDate ? "Present" : formatDate(e.endDate, { month: "short", year: "numeric" })}</p>{e.description && <p className="mt-1 text-sm">{e.description}</p>}</>)} />
      <FormDialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? "Add experience" : "Edit experience"}>
        <form onSubmit={handleSubmit(save)} className="space-y-3" noValidate>
          <FormField id="exp-title" label="Job title" required error={errors.title?.message}><Input id="exp-title" {...register("title")} /></FormField>
          <FormField id="exp-company" label="Company" required error={errors.company?.message}><Input id="exp-company" {...register("company")} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="exp-start" label="Start date" required error={errors.startDate?.message}><Input id="exp-start" type="date" {...register("startDate")} /></FormField>
            <FormField id="exp-end" label="End date" error={errors.endDate?.message}><Input id="exp-end" type="date" disabled={current} {...register("endDate")} /></FormField>
          </div>
          <div className="flex items-center gap-2"><Checkbox id="exp-current" checked={!!current} onCheckedChange={(c) => setValue("current", c === true)} /><label htmlFor="exp-current" className="text-sm">I currently work here</label></div>
          <FormField id="exp-desc" label="Description" error={errors.description?.message}><Textarea id="exp-desc" rows={3} {...register("description")} /></FormField>
          <SubmitRow busy={isSubmitting} onCancel={() => setEditing(null)} />
        </form>
      </FormDialog>
      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} destructive title="Delete this experience?" description={`"${removing?.title}" will be removed from your profile.`} confirmLabel="Delete" onConfirm={async () => { await onChange(items.filter((i) => i.id !== removing?.id)); setRemoving(null); }} />
    </>
  );
}

/* ---------------- Projects ---------------- */
export function ProjectsSection({ items, onChange }: { items: Project[]; onChange: (next: Project[]) => Promise<void> }) {
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [removing, setRemoving] = useState<Project | null>(null);
  const [tech, setTech] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProjectValues>({ resolver: zodResolver(projectSchema) });

  const open = (item: Project | "new") => {
    reset(item === "new" ? { name: "", description: "", url: "" } : { name: item.name, description: item.description, url: item.url ?? "" });
    setTech(item === "new" ? "" : item.techStack.join(", "));
    setEditing(item);
  };
  const save = async (v: ProjectValues) => {
    const entry: Project = { id: editing && editing !== "new" ? editing.id : nextLocalId("prj"), name: v.name, description: v.description, url: v.url, techStack: tech.split(",").map((t) => t.trim()).filter(Boolean) };
    await onChange(editing === "new" ? [entry, ...items] : items.map((i) => (i.id === entry.id ? entry : i)));
    setEditing(null);
  };

  return (
    <>
      <Section title="Projects" icon={FolderGit2} items={items} emptyText="No projects added yet" onAdd={() => open("new")} onEdit={open} onDelete={setRemoving}
        render={(p) => (<><p className="font-medium">{p.name}</p><p className="text-sm text-muted-foreground">{p.description}</p>{p.techStack.length > 0 && <div className="mt-2"><SkillChips skills={p.techStack} /></div>}{p.url && <a href={p.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-primary hover:underline">View project ↗</a>}</>)} />
      <FormDialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? "Add project" : "Edit project"}>
        <form onSubmit={handleSubmit(save)} className="space-y-3" noValidate>
          <FormField id="prj-name" label="Project name" required error={errors.name?.message}><Input id="prj-name" {...register("name")} /></FormField>
          <FormField id="prj-desc" label="Description" required error={errors.description?.message}><Textarea id="prj-desc" rows={3} {...register("description")} /></FormField>
          <FormField id="prj-tech" label="Tech stack" hint="Comma-separated, e.g. React, FastAPI"><Input id="prj-tech" value={tech} onChange={(e) => setTech(e.target.value)} /></FormField>
          <FormField id="prj-url" label="Project link" error={errors.url?.message}><Input id="prj-url" placeholder="https://github.com/…" {...register("url")} /></FormField>
          <SubmitRow busy={isSubmitting} onCancel={() => setEditing(null)} />
        </form>
      </FormDialog>
      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} destructive title="Delete this project?" description={`"${removing?.name}" will be removed from your profile.`} confirmLabel="Delete" onConfirm={async () => { await onChange(items.filter((i) => i.id !== removing?.id)); setRemoving(null); }} />
    </>
  );
}

/* ---------------- Certifications ---------------- */
export function CertificationsSection({ items, onChange }: { items: Certification[]; onChange: (next: Certification[]) => Promise<void> }) {
  const [editing, setEditing] = useState<Certification | "new" | null>(null);
  const [removing, setRemoving] = useState<Certification | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CertificationValues>({ resolver: zodResolver(certificationSchema) });

  const open = (item: Certification | "new") => {
    reset(item === "new" ? { name: "", issuer: "", year: "" } : { name: item.name, issuer: item.issuer, year: String(item.year) });
    setEditing(item);
  };
  const save = async (v: CertificationValues) => {
    const entry: Certification = { id: editing && editing !== "new" ? editing.id : nextLocalId("cert"), name: v.name, issuer: v.issuer, year: Number(v.year) };
    await onChange(editing === "new" ? [entry, ...items] : items.map((i) => (i.id === entry.id ? entry : i)));
    setEditing(null);
  };

  return (
    <>
      <Section title="Certifications" icon={Award} items={items} emptyText="No certifications added yet" onAdd={() => open("new")} onEdit={open} onDelete={setRemoving}
        render={(c) => (<><p className="font-medium">{c.name}</p><p className="text-sm text-muted-foreground">{c.issuer} · {c.year}</p></>)} />
      <FormDialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === "new" ? "Add certification" : "Edit certification"}>
        <form onSubmit={handleSubmit(save)} className="space-y-3" noValidate>
          <FormField id="cert-name" label="Name" required error={errors.name?.message}><Input id="cert-name" {...register("name")} /></FormField>
          <FormField id="cert-issuer" label="Issuing organisation" required error={errors.issuer?.message}><Input id="cert-issuer" {...register("issuer")} /></FormField>
          <FormField id="cert-year" label="Year" required error={errors.year?.message}><Input id="cert-year" inputMode="numeric" placeholder="2025" {...register("year")} /></FormField>
          <SubmitRow busy={isSubmitting} onCancel={() => setEditing(null)} />
        </form>
      </FormDialog>
      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} destructive title="Delete this certification?" description={`"${removing?.name}" will be removed from your profile.`} confirmLabel="Delete" onConfirm={async () => { await onChange(items.filter((i) => i.id !== removing?.id)); setRemoving(null); }} />
    </>
  );
}
