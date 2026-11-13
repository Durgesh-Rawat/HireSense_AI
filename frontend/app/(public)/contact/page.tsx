import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/auth/contact-form";
import { SITE } from "@/constants/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
      <p className="mt-2 text-muted-foreground">Questions, feedback or partnership ideas? Send us a message.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="p-6"><ContactForm /></Card>
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: SITE.email },
            { icon: Clock, label: "Response time", value: "Within 1–2 working days" },
            { icon: MapPin, label: "Location", value: "India (academic project)" },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label} className="flex items-start gap-3 p-4">
              <Icon className="mt-0.5 size-5 text-primary" />
              <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
