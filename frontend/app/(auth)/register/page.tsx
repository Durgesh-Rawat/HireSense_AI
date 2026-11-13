import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Create an account" };

const ROLES = [
  { href: "/register/candidate", icon: UserRound, title: "I'm a candidate", text: "Find jobs, upload your resume and track applications." },
  { href: "/register/recruiter", icon: Briefcase, title: "I'm a recruiter", text: "Post jobs and review AI-ranked applicants." },
];

export default function RegisterChoicePage() {
  return (
    <AuthCard title="Join the platform" description="Choose how you'd like to use your account." footer={<>Already registered? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link></>}>
      <div className="space-y-3">
        {ROLES.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="group block">
            <Card className="flex items-center gap-4 p-4 transition-colors group-hover:border-primary group-hover:bg-accent/40">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span>
              <div className="flex-1"><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{text}</p></div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </Card>
          </Link>
        ))}
      </div>
    </AuthCard>
  );
}
