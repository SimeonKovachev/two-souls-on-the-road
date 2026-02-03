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

export function GoldLine({ className = "" }: OrnamentProps) {
  return <div className={`gold-line w-full my-6 ${className}`} />;
}

export function PageDivider({ className = "" }: OrnamentProps) {
  return (
    <div className={`flex items-center justify-center gap-4 my-8 ${className}`}>
      <div className="gold-line flex-1 max-w-[100px]" />
      <span className="text-gold text-sm">✧</span>
      <div className="gold-line flex-1 max-w-[100px]" />
    </div>
  );
}
