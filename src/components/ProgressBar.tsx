"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          שאלה {current} מתוך {total}
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>
          {percentage}%
        </span>
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-dark)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)",
          }}
        />
      </div>
    </div>
  );
}
