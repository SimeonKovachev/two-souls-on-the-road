"use client";

import { Author, AUTHORS } from "@/lib/types";

interface AuthorSelectorProps {
  selected: Author;
  onChange: (author: Author) => void;
  label?: string;
  disabled?: boolean;
}

export function AuthorSelector({ selected, onChange, label, disabled = false }: AuthorSelectorProps) {
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm text-midnight-soft font-body italic">{label}</p>
      )}
      <div className="flex gap-2">
        {AUTHORS.map((author) => (
          <button
            key={author.id}
            onClick={() => onChange(author.id)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              border transition-all
              ${selected === author.id
                ? "bg-plum text-parchment border-plum"
                : "bg-cream border-parchment-dark text-midnight-soft hover:border-gold"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span>{author.icon}</span>
            <span className="font-display text-sm">{author.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface AuthorBadgeProps {
  author: Author;
  size?: "sm" | "md";
}

export function AuthorBadge({ author, size = "sm" }: AuthorBadgeProps) {
  const authorInfo = AUTHORS.find((a) => a.id === author);
  if (!authorInfo) return null;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full
        ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}
        bg-parchment-dark text-midnight-soft
      `}
    >
      <span>{authorInfo.icon}</span>
      <span>{authorInfo.name}</span>
    </span>
  );
}
