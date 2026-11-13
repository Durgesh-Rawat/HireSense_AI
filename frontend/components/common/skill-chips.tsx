import { Badge } from "@/components/ui/badge";

export function SkillChips({
  skills, variant = "secondary", max,
}: { skills: string[]; variant?: "secondary" | "accent" | "success" | "destructive" | "outline"; max?: number }) {
  const shown = max ? skills.slice(0, max) : skills;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <Badge key={s} variant={variant} className="font-normal">
          {s}
        </Badge>
      ))}
      {max && skills.length > max && <Badge variant="outline" className="font-normal">+{skills.length - max}</Badge>}
    </div>
  );
}
