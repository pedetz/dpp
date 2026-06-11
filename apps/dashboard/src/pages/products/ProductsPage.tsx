import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { ProductList } from "@/components/products/ProductList";
import { ImportCSV } from "@/components/products/ImportCSV";
import { useOrg } from "@/hooks/useOrg";
import { useProducts, useBulkCreateProducts } from "@/hooks/useProducts";
import { useSubscription } from "@/hooks/useBilling";
import { getPlan } from "@/lib/plans";
import { getTemplate } from "@/lib/templates";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

export function ProductsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { org, orgId } = useOrg();
  const { data, isLoading } = useProducts(orgId);
  const subscription = useSubscription(orgId);
  const bulkCreate = useBulkCreateProducts(orgId);
  const [importOpen, setImportOpen] = useState(false);

  const plan = subscription.data?.plan ?? org?.plan ?? "trial";
  const limits = getPlan(plan);
  const count = data?.length ?? 0;
  const atLimit = count >= limits.maxProducts;

  const handleNew = () => {
    if (atLimit) {
      toast.error(t("billingLimit.reached"));
      return;
    }
    navigate("/products/new");
  };

  return (
    <div>
      <PageHeader
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        actions={
          <>
            {limits.csvImport ? (
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" />
                {t("csv.title")}
              </Button>
            ) : null}
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4" />
              {t("products.new")}
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <ProductList products={data ?? []} />
      )}

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title={t("csv.title")}>
        <ImportCSV
          fields={getTemplate("tessile")}
          category="tessile"
          onImport={async (rows) => {
            await bulkCreate.mutateAsync(rows);
          }}
        />
      </Modal>
    </div>
  );
}
