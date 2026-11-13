"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { publicService } from "@/services/public.service";
import { toApiError } from "@/services/api";
import { contactSchema, type ContactValues } from "@/lib/validation";

export function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });
  const onSubmit = async (v: ContactValues) => {
    try {
      await publicService.sendContactMessage(v);
      toast.success("Message sent. We'll get back to you soon.");
      reset();
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="name" label="Name" required error={errors.name?.message}><Input id="name" aria-invalid={!!errors.name} {...register("name")} /></FormField>
        <FormField id="email" label="Email" required error={errors.email?.message}><Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} /></FormField>
      </div>
      <FormField id="subject" label="Subject" required error={errors.subject?.message}><Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} /></FormField>
      <FormField id="message" label="Message" required error={errors.message?.message}><Textarea id="message" rows={5} aria-invalid={!!errors.message} {...register("message")} /></FormField>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Send message</Button>
    </form>
  );
}
