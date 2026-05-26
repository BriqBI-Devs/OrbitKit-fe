"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Comma / Enter separated tag editor. Stores a string array. */
export function TagsInput({
  value,
  onChange,
  placeholder = "Add a tag and press Enter",
  className,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const next = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .filter((t) => !value.includes(t));
    if (next.length) onChange([...value, ...next]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        "border-input bg-transparent focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
        className
      )}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="hover:text-destructive"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="placeholder:text-muted-foreground min-w-[8rem] flex-1 bg-transparent outline-none"
      />
    </div>
  );
}
