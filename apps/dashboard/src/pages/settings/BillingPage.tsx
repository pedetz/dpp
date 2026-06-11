import { useQuery } from '@tanstack/react-query'
import type { Subscription } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'
import { useOrg } from '@/hooks/useOrg'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlanCard } from '@/components/billing/PlanCard'
import { CheckoutRedirect } from '@/components/billing/CheckoutRedirect'
import { Button } from '@/components/ui/Button'
import { plans, planOrder } from '@/lib/plans'
import t from '@/i18n/it.json'

export default function BillingPage() {
  const { org } = useOrg()

  const { data: subscription } = useQuery({
    queryKey: ['subscription', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('org_id', org!.id)
        .maybeSingle()
      if (error) throw error
      return data as Subscription | null
    },
  })

  const currentPlan = org?.plan ?? 'trial'

  const handlePortal = async () => {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { returnUrl: window.location.href },
    })
    if (!error && data?.url) window.location.href = data.url
  }

  const displayedPlans = planOrder.filter((p) => p !== 'trial')

  return (
    <div>
      <PageHeader
        title={t.nav_billing}
        subtitle={`Piano attuale: ${currentPlan}`}
        actions={
          subscription?.stripe_customer_id ? (
            <Button variant="secondary" onClick={handlePortal}>
              {t.billing_manage}
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl">
        {displayedPlans.map((plan) => {
          const def = plans[plan]
          return (
            <PlanCard
              key={plan}
              plan={plan}
              priceMonthly={def.priceMonthly}
              featureKeys={def.featureKeys}
              isCurrent={currentPlan === plan}
              onSelect={currentPlan !== plan ? undefined : undefined}
            />
          )
        })}
      </div>

      {currentPlan === 'trial' && (
        <div className="mt-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 max-w-lg">
            <p className="text-sm text-amber-800 font-medium">Sei nel piano Trial gratuito.</p>
            <p className="mt-1 text-sm text-amber-700">Passa a un piano a pagamento per sbloccare più prodotti e funzionalità.</p>
            <div className="mt-3 flex gap-2">
              <CheckoutRedirect plan="starter" label={`${t.billing_upgrade} Starter`} />
              <CheckoutRedirect plan="pro" label={`${t.billing_upgrade} Pro`} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
