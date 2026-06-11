import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCustomerPortal } from "@/hooks/useBilling";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

export function CustomerPortalLink({ orgId }: { orgId: string | null }) {
  const portal = useCustomerPortal(orgId);
  const toast = useToast();

  const handle = () => {
    portal.mutate(undefined, {
      onSuccess: (url) => {
        window.location.href = url;
      },
      onError: () => toast.error(t("common.error")),
    });
  };

  return (
    <Button variant="secondary" loading={portal.isPending} onClick={handle}>
      <ExternalLink className="h-4 w-4" />
      {t("billing.customerPortal")}
    </Button>
  );
}
