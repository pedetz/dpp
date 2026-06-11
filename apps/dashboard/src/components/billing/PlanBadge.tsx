import type { Plan } from "@passaporto/shared";
import { Badge } from "@/components/ui/Badge";
import { t } from "@/i18n";

export function PlanBadge({ plan }: { plan: Plan }) {
  return <Badge variant={plan}>{t(`billing.plans.${plan}`)}</Badge>;
}
