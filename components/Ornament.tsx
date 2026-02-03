"use client";

interface OrnamentProps {
  className?: string;
}

export function Ornament({ className = "" }: OrnamentProps) {
  return (
    <div className={`ornament text-center ${className}`}>
      ✦ ✧ ✦
    </div>
  );
}

// Renamed from GoldLine to MysticLine (purple/silver gradient)
export function GoldLine({ className = "" }: OrnamentProps) {
  return <div className={`mystic-line w-full my-6 ${className}`} />;
}

// Alias for backwards compatibility
export const MysticLine = GoldLine;

export function PageDivider({ className = "" }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-4 my-8 ${className}`}>
      <div className="mystic-line flex-1 max-w-[100px]" />
      <span className="text-lavender text-sm">✧</span>
      <div className="mystic-line flex-1 max-w-[100px]" />
    </div>
  );
}
