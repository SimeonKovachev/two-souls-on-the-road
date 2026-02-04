"use client";

import { Star } from "lucide-react";

interface OrnamentProps {
  className?: string;
}

export function Ornament({ className = "" }: OrnamentProps) {
  return (
    <div className={`text-center flex items-center justify-center gap-2 text-lavender ${className}`}>
      <Star className="w-3 h-3 fill-current" />
      <Star className="w-4 h-4" />
      <Star className="w-3 h-3 fill-current" />
    </div>
  );
}

export function GoldLine({ className = "" }: OrnamentProps) {
  return <div className={`mystic-line w-full my-6 ${className}`} />;
}

export const MysticLine = GoldLine;

export function PageDivider({ className = "" }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-4 my-8 ${className}`}>
      <div className="mystic-line flex-1 max-w-[100px]" />
      <Star className="w-4 h-4 text-lavender" />
      <div className="mystic-line flex-1 max-w-[100px]" />
    </div>
  );
}
