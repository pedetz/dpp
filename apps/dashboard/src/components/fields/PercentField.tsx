import { Input } from '@/components/ui/Input'

interface PercentFieldProps {
  label?: string
  value: number
  onChange: (v: number) => void
  error?: string
}

export function PercentField({ label, value, onChange, error }: PercentFieldProps) {
  const clamped = Math.max(0, Math.min(100, value || 0))

  return (
    <div className="space-y-2">
      <Input
        label={label}
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        error={error}
      />
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-2 rounded-full bg-green-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
