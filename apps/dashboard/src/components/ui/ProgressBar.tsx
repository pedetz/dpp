import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

function color(value: number): string {
  if (value >= 100) return "bg-green-500";
  if (value >= 60) return "bg-brand-500";
  if (value >= 30) return "bg-amber-500";
  return "bg-red-500";
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-gray-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all", color(clamped))}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
