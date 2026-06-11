import type { TemplateField, ProductData, FiberEntry } from '@passaporto/shared'
import { CompositionField } from './CompositionField'
import { CountryField } from './CountryField'
import { PercentField } from './PercentField'
import { CareSymbolsField } from './CareSymbolsField'
import { Textarea } from '@/components/ui/Textarea'

interface FieldRendererProps {
  field: TemplateField
  data: ProductData
  onChange: (key: string, value: unknown) => void
  error?: string
}

export function FieldRenderer({ field, data, onChange, error }: FieldRendererProps) {
  const value = data[field.key]

  if (field.type === 'composition') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label_it}</label>
        <CompositionField
          value={(value as FiberEntry[]) ?? []}
          onChange={(v) => onChange(field.key, v)}
          error={error}
        />
      </div>
    )
  }

  if (field.type === 'country') {
    return (
      <CountryField
        label={field.label_it}
        value={(value as string) ?? ''}
        onChange={(v) => onChange(field.key, v)}
        error={error}
      />
    )
  }

  if (field.type === 'percent') {
    return (
      <PercentField
        label={field.label_it}
        value={(value as number) ?? 0}
        onChange={(v) => onChange(field.key, v)}
        error={error}
      />
    )
  }

  if (field.type === 'care_symbols') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label_it}</label>
        <CareSymbolsField
          value={(value as string[]) ?? []}
          onChange={(v) => onChange(field.key, v)}
          error={error}
        />
      </div>
    )
  }

  return (
    <Textarea
      label={field.label_it}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(field.key, e.target.value)}
      error={error}
      rows={3}
    />
  )
}
