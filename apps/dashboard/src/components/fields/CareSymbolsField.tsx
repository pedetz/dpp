import { cn } from '@/lib/utils'
import { careSymbols } from '@/lib/careSymbols'

interface CareSymbolsFieldProps {
  value: string[]
  onChange: (v: string[]) => void
  error?: string
}

export function CareSymbolsField({ value, onChange, error }: CareSymbolsFieldProps) {
  const toggle = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {careSymbols.map((symbol) => {
          const active = value.includes(symbol.key)
          return (
            <button
              key={symbol.key}
              type="button"
              onClick={() => toggle(symbol.key)}
              className={cn(
                'rounded-md border px-3 py-2 text-left text-xs transition-colors',
                active
                  ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {symbol.label_it}
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
