import { Check } from "lucide-react";
import type { Plan } from "@passaporto/shared";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { getPlan } from "@/lib/plans";
import { t } from "@/i18n";

interface PlanCardProps {
  plan: Plan;
  current: boolean;
  loading?: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, current, loading, onSelect }: PlanCardProps) {
  const def = getPlan(plan);
  return (
    <Card className={cn(current && "ring-2 ring-brand-500")}>
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
        <ul className="flex flex-col gap-2 text-sm text-gray-600">
          {def.featureKeys.map((key) => (
            <li key={key} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {t(`billing.features.${key}`)}
            </li>
          ))}
        </ul>
        <Button
          variant={current ? "secondary" : "primary"}
          disabled={current}
          loading={loading}
          onClick={() => onSelect(plan)}
        >
          {current ? t("billing.currentLabel") : t("billing.choosePlan")}
        </Button>
      </CardBody>
    </Card>
  );
}
