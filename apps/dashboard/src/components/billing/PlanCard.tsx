import { Check } from 'lucide-react'
import type { Plan } from '@passaporto/shared'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import t from '@/i18n/it.json'

const featureLabels: Record<string, string> = {
  maxProducts3: 'Fino a 3 prodotti',
  maxProducts100: 'Fino a 100 prodotti',
  maxProducts1000: 'Fino a 1.000 prodotti',
  unlimited: 'Prodotti illimitati',
  qr: 'QR Code per ogni prodotto',
  publish: 'Pubblicazione passaporto',
  csvImport: 'Importazione CSV',
  bulkExport: 'Export massivo',
  api: 'Accesso API',
  multiBrand: 'Multi-brand',
  support: 'Supporto prioritario',
}

const planNameMap: Record<Plan, string> = {
  trial: t.plan_trial,
  starter: t.plan_starter,
  pro: t.plan_pro,
  filiera: t.plan_filiera,
}

interface PlanCardProps {
  plan: Plan
  priceMonthly: number
  featureKeys: string[]
  isCurrent: boolean
  onSelect?: () => void
  loading?: boolean
}

export function PlanCard({ plan, priceMonthly, featureKeys, isCurrent, onSelect, loading }: PlanCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 space-y-4',
        isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white',
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{planNameMap[plan]}</h3>
          {isCurrent && (
            <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {t.billing_current_plan}
            </span>
          )}
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {priceMonthly === 0 ? 'Gratuito' : `${formatPrice(priceMonthly)}/mese`}
        </p>
      </div>

      <ul className="space-y-2">
        {featureKeys.map((key) => (
          <li key={key} className="flex items-start gap-2 text-sm text-gray-700">
            <Check className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
            {featureLabels[key] ?? key}
          </li>
        ))}
      </ul>

      {!isCurrent && onSelect && (
        <Button variant="secondary" className="w-full" onClick={onSelect} loading={loading}>
          {t.billing_upgrade} {planNameMap[plan]}
        </Button>
      )}
    </div>
  )
}
