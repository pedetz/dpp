import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProductForm } from "@/components/products/ProductForm";
import type { ProductFormValue } from "@/components/products/ProductForm";
import { useOrg } from "@/hooks/useOrg";
import { useCreateProduct } from "@/hooks/useProducts";
import { getTemplate } from "@/lib/templates";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

const initial: ProductFormValue = {
  name: "",
  sku: "",
  gtin: "",
  category: "tessile",
  data: {},
  images: [],
};

export function NewProductPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgId } = useOrg();
  const create = useCreateProduct(orgId);
  const [value, setValue] = useState<ProductFormValue>(initial);

  const submit = () => {
    create.mutate(
      {
        name: value.name,
        sku: value.sku || null,
        gtin: value.gtin || null,
        category: value.category,
        data: value.data,
        images: value.images,
      },
      {
        onSuccess: (product) => {
          toast.success(t("products.createdToast"));
          navigate(`/products/${product.id}`);
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <div>
      <PageHeader title={t("products.createTitle")} />
      <Card>
        <CardBody>
          <ProductForm
            value={value}
            fields={getTemplate(value.category)}
            onChange={setValue}
            imagePrefix={`products/${orgId ?? "draft"}`}
          />
        </CardBody>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate("/products")}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!value.name} loading={create.isPending} onClick={submit}>
            {t("products.saveDraft")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
