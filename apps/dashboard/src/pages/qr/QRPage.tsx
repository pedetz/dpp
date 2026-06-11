import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { QRCode } from "@/components/qr/QRCode";
import { QRDownload } from "@/components/qr/QRDownload";
import { useOrg } from "@/hooks/useOrg";
import { useProducts } from "@/hooks/useProducts";
import { passportUrl } from "@/lib/passportUrl";
import { t } from "@/i18n";

export function QRPage() {
  const { orgId } = useOrg();
  const { data, isLoading } = useProducts(orgId);
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(params.get("product") ?? "");

  const product = useMemo(
    () => data?.find((p) => p.id === selected) ?? null,
    [data, selected],
  );

  return (
    <div>
      <PageHeader title={t("qr.title")} subtitle={t("qr.subtitle")} />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card className="max-w-lg">
          <CardBody className="flex flex-col items-center gap-5">
            <Select
              className="w-full"
              placeholder={t("qr.selectProduct")}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              options={(data ?? []).map((p) => ({ value: p.id, label: p.name }))}
            />
            {product ? (
              <>
                <QRCode value={passportUrl(product)} />
                <div className="w-full break-all rounded-lg bg-gray-50 p-3 text-center text-xs text-gray-500">
                  <p className="mb-1 font-medium text-gray-700">
                    {product.gtin ? t("qr.withGtin") : t("qr.noGtin")}
                  </p>
                  {passportUrl(product)}
                </div>
                <QRDownload value={passportUrl(product)} filename={product.slug} />
              </>
            ) : null}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
