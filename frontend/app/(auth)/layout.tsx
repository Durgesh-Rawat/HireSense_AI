import { Logo } from "@/components/common/logo";
import { RedirectIfAuthenticated } from "@/components/layout/role-guard";
import { SITE } from "@/constants/site";
import { BrainCircuit, CheckCircle2 } from "lucide-react";

const POINTS = ["AI-ranked candidates for every job", "One resume, unlimited applications", "Track every application in real time"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col px-6 py-8 sm:px-12">
          <Logo />
          <div className="flex flex-1 items-center justify-center py-10">{children}</div>
        </div>
        <aside className="hidden flex-col justify-center bg-gradient-to-br from-indigo-600 to-indigo-800 p-14 text-white lg:flex">
          <BrainCircuit className="mb-6 size-10 text-indigo-200" />
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-balance">{SITE.tagline}</h2>
          <ul className="mt-8 space-y-3 text-indigo-100">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-2.5"><CheckCircle2 className="size-5 text-indigo-300" />{p}</li>
            ))}
          </ul>
        </aside>
      </div>
    </RedirectIfAuthenticated>
  );
}
