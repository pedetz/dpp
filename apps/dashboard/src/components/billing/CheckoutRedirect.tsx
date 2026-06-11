import type { Plan } from "@passaporto/shared";
import { Button } from "@/components/ui/Button";
import { useCheckout } from "@/hooks/useBilling";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

interface CheckoutRedirectProps {
  orgId: string | null;
  plan: Plan;
  current: boolean;
}

export function CheckoutRedirect({ orgId, plan, current }: CheckoutRedirectProps) {
  const checkout = useCheckout(orgId);
  const toast = useToast();

  const handle = () => {
    checkout.mutate(plan, {
      onSuccess: (url) => {
        window.location.href = url;
      },
      onError: () => toast.error(t("common.error")),
    });
  };

  return (
    <Button
      variant={current ? "secondary" : "primary"}
      disabled={current}
      loading={checkout.isPending}
      onClick={handle}
    >
      {current ? t("billing.currentLabel") : t("billing.choosePlan")}
    </Button>
  );
}
