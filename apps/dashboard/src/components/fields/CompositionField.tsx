import { Plus, Trash2 } from 'lucide-react'
import type { FiberEntry } from '@passaporto/shared'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'

const COMMON_FIBERS = [
  'Cotone', 'Lino', 'Lana', 'Seta', 'Poliestere',
  'Nylon', 'Viscosa', 'Cashmere', 'Elastan',
]

interface CompositionFieldProps {
  value: FiberEntry[]
  onChange: (v: FiberEntry[]) => void
  error?: string
}

export function CompositionField({ value, onChange, error }: CompositionFieldProps) {
  const total = value.reduce((sum, e) => sum + (e.percent || 0), 0)

  const add = () => onChange([...value, { fiber: COMMON_FIBERS[0], percent: 0 }])

  const update = (i: number, patch: Partial<FiberEntry>) => {
    const next = value.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    onChange(next)
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  const fiberOptions = COMMON_FIBERS.map((f) => ({ value: f, label: f }))

  return (
    <div className="space-y-2">
      {value.map((entry, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <Select
              options={fiberOptions}
              value={entry.fiber}
              onChange={(e) => update(i, { fiber: e.target.value })}
            />
          </div>
          <div className="w-28">
            <Input
              type="number"
              min={0}
              max={100}
              value={entry.percent}
              onChange={(e) => update(i, { percent: Number(e.target.value) })}
              placeholder="%"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mb-0.5 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />
          Aggiungi fibra
        </Button>
        <span className={`text-sm font-medium ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>
          Totale: {total}%
        </span>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {total !== 100 && value.length > 0 && (
        <p className="text-xs text-amber-600">La somma deve essere 100%</p>
      )}
    </div>
  )
}
