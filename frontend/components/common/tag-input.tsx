"use client";
import { useId, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COMMON_SKILLS } from "@/constants/job";

/** Free-form tag editor (skills). Press Enter or comma to add. */
export function TagInput({
  id, value, onChange, placeholder = "Type a skill and press Enter", suggestions = COMMON_SKILLS, invalid,
}: { id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[]; invalid?: boolean }) {
  const [draft, setDraft] = useState("");
  const listId = useId();

  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, "").trim();
    if (!tag) return;
    if (!value.some((v) => v.toLowerCase() === tag.toLowerCase())) onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={draft}
        list={listId}
        placeholder={placeholder}
        aria-invalid={invalid}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => add(draft)}
      />
      <datalist id={listId}>
        {suggestions.filter((s) => !value.includes(s)).map((s) => <option key={s} value={s} />)}
      </datalist>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="accent" className="gap-1 pr-1 font-normal">
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((v) => v !== tag))} className="rounded-full p-0.5 hover:bg-indigo-100 cursor-pointer">
                <X />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
