import type { ProductStatus as Status } from "@passaporto/shared";
import { Badge } from "@/components/ui/Badge";
import { t } from "@/i18n";

export function ProductStatus({ status }: { status: Status }) {
  return <Badge variant={status}>{t(`status.${status}`)}</Badge>;
}
