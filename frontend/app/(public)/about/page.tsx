import type { Metadata } from "next";
import { Eye, Layers, ShieldCheck, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SITE } from "@/constants/site";

export const metadata: Metadata = { title: "About" };

const MODULES = [
  { title: "Frontend", text: "Next.js, React, TypeScript and Tailwind CSS — the web interface for candidates, recruiters and admins." },
  { title: "Backend", text: "Python FastAPI with PostgreSQL — authentication, jobs, applications and data storage." },
  { title: "AI engine", text: "Python NLP — resume parsing, embeddings and semantic matching between resumes and jobs." },
];
const VALUES = [
  { icon: Target, title: "Relevance first", text: "Help recruiters find qualified people faster, and help candidates find roles that fit." },
  { icon: Eye, title: "Explainable AI", text: "Every score comes with the reasons behind it: matching skills, gaps and areas to verify." },
  { icon: ShieldCheck, title: "Humans decide", text: "AI assists the process. Hiring decisions always stay with people." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">About {SITE.name}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
        {SITE.name} is a final-year B.Tech Computer Science project: a web-based job portal that connects job seekers with recruiters and uses AI-powered resume screening to help recruiters identify suitable candidates.
      </p>

      <h2 className="mt-12 mb-4 text-xl font-semibold">What we believe</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <Card key={title} className="p-5">
            <Icon className="mb-3 size-6 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 mb-4 flex items-center gap-2 text-xl font-semibold"><Layers className="size-5" /> How the project is built</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((m) => (
          <Card key={m.title} className="p-5">
            <h3 className="font-semibold">{m.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{m.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
