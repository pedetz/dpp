interface PercentFieldProps {
  value: number;
  onChange: (value: number) => void;
}

export function PercentField({ value, onChange }: PercentFieldProps) {
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={0}
        max={100}
        value={safe}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-brand-600"
      />
      <input
        type="number"
        min={0}
        max={100}
        value={safe}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-lg border-gray-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
      />
    </div>
  );
}
