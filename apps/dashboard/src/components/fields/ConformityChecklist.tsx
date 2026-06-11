import { AlertCircle } from 'lucide-react'
import type { TemplateField, ProductData } from '@passaporto/shared'
import { missingRequiredFields } from '@/lib/conformity'
import t from '@/i18n/it.json'

interface ConformityChecklistProps {
  fields: TemplateField[]
  data: ProductData
}

export function ConformityChecklist({ fields, data }: ConformityChecklistProps) {
  const missing = missingRequiredFields(fields, data)

  if (missing.length === 0) return null

  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm font-medium text-red-700">
          {t.conformity_missing}
          <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
            {missing.length}
          </span>
        </span>
      </div>
      <ul className="space-y-1">
        {missing.map((field) => (
          <li key={field.key} className="text-sm text-red-600">
            • {field.label_it}
          </li>
        ))}
      </ul>
    </div>
  )
}
