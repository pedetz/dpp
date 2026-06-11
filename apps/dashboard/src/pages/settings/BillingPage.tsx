import { Check } from "lucide-react";
import type { Plan } from "@passaporto/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsTabs } from "@/components/layout/SettingsTabs";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { CheckoutRedirect } from "@/components/billing/CheckoutRedirect";
import { CustomerPortalLink } from "@/components/billing/CustomerPortalLink";
import { useOrg } from "@/hooks/useOrg";
import { useSubscription } from "@/hooks/useBilling";
import { planOrder, getPlan } from "@/lib/plans";
import { formatDate, formatPrice } from "@/lib/utils";
import { t } from "@/i18n";

function PlanColumn({
  plan,
  current,
  orgId,
}: {
  plan: Plan;
  current: boolean;
  orgId: string | null;
}) {
  const def = getPlan(plan);
  return (
    <Card className={current ? "ring-2 ring-brand-500" : undefined}>
      <CardBody className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t(`billing.plans.${plan}`)}
          </h3>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {def.priceMonthly === 0 ? t("billing.free") : formatPrice(def.priceMonthly)}
            </span>
            {def.priceMonthly > 0 ? (
              <span className="text-sm text-gray-500">{t("billing.perMonth")}</span>
            ) : null}
          </div>
        </div>
        <ul className="flex flex-1 flex-col gap-2 text-sm text-gray-600">
          {def.featureKeys.map((key) => (
            <li key={key} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {t(`billing.features.${key}`)}
            </li>
          ))}
        </ul>
        {plan === "trial" ? (
          <Button variant="secondary" disabled>
            {current ? t("billing.currentLabel") : t("billing.choosePlan")}
          </Button>
        ) : (
          <CheckoutRedirect orgId={orgId} plan={plan} current={current} />
        )}
      </CardBody>
    </Card>
  );
}

export function BillingPage() {
  const { org, orgId } = useOrg();
  const { data: subscription, isLoading } = useSubscription(orgId);
  const currentPlan = subscription?.plan ?? org?.plan ?? "trial";

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={t("billing.title")} subtitle={t("billing.subtitle")} />
      <SettingsTabs />

      <div className="flex flex-col gap-6">
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{t("billing.currentPlan")}</span>
              <PlanBadge plan={currentPlan} />
              {subscription?.current_period_end ? (
                <span className="text-sm text-gray-500">
                  {t("billing.renewsOn", {
                    date: formatDate(subscription.current_period_end),
                  })}
                </span>
              ) : null}
            </div>
            {subscription?.stripe_customer_id ? <CustomerPortalLink orgId={orgId} /> : null}
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {planOrder.map((plan) => (
            <PlanColumn
              key={plan}
              plan={plan}
              current={currentPlan === plan}
              orgId={orgId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
