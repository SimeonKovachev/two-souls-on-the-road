"use client";

interface AnniversaryCounterProps {
  startDate: string; // YYYY-MM-DD
  className?: string;
}

export function AnniversaryCounter({ startDate, className = "" }: AnniversaryCounterProps) {
  const start = new Date(startDate);
  const now = new Date();

  // Calculate difference
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Years, months, days
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = diffDays % 30;

  return (
    <div className={`text-center ${className}`}>
      <p className="text-xs text-midnight-soft mb-1 italic">Together for</p>
      <div className="flex items-center justify-center gap-3 text-plum font-display">
        {years > 0 && (
          <div className="text-center">
            <span className="text-2xl">{years}</span>
            <span className="text-xs block text-midnight-soft">year{years !== 1 ? "s" : ""}</span>
          </div>
        )}
        {(years > 0 || months > 0) && (
          <div className="text-center">
            <span className="text-2xl">{months}</span>
            <span className="text-xs block text-midnight-soft">month{months !== 1 ? "s" : ""}</span>
          </div>
        )}
        <div className="text-center">
          <span className="text-2xl">{days}</span>
          <span className="text-xs block text-midnight-soft">day{days !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <p className="text-lavender text-lg mt-1">
        {diffDays.toLocaleString()} days of love ✨
      </p>
    </div>
  );
}

// Check if today is anniversary
export function isAnniversary(startDate: string): boolean {
  if (!startDate) return false;
  const today = new Date();
  const start = new Date(startDate);
  return today.getMonth() === start.getMonth() && today.getDate() === start.getDate();
}

// Get anniversary year (how many years together)
export function getAnniversaryYear(startDate: string): number {
  const today = new Date();
  const start = new Date(startDate);
  return today.getFullYear() - start.getFullYear();
}
