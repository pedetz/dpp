import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { LabelSheetConfig } from "@/components/qr/LabelSheetConfig";
import { useOrg } from "@/hooks/useOrg";
import { useProducts } from "@/hooks/useProducts";
import { t } from "@/i18n";

export function LabelsPage() {
  const { orgId } = useOrg();
  const { data, isLoading } = useProducts(orgId);

  return (
    <div>
      <PageHeader title={t("qr.labelsTitle")} subtitle={t("qr.labelsSubtitle")} />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card className="max-w-2xl">
          <CardBody>
            <LabelSheetConfig products={data ?? []} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
