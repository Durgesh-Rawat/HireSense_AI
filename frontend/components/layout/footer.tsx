import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { SITE } from "@/constants/site";

const COLUMNS = [
  { title: "Candidates", links: [{ label: "Browse jobs", href: "/jobs" }, { label: "Create account", href: "/register/candidate" }, { label: "Sign in", href: "/login" }] },
  { title: "Recruiters", links: [{ label: "Post a job", href: "/register/recruiter" }, { label: "AI screening", href: "/#ai-screening" }, { label: "Sign in", href: "/login" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{SITE.description}</p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {SITE.name}. Final-year B.Tech CSE project.
        </p>
      </div>
    </footer>
  );
}
