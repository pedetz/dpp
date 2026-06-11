import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Organization } from "@passaporto/shared";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { ProductForm } from "@/components/products/ProductForm";
import type { ProductFormValue } from "@/components/products/ProductForm";
import { useCreateOrg, useUpdateOrg } from "@/hooks/useOrg";
import { useCreateProduct } from "@/hooks/useProducts";
import { uploadPublicImage } from "@/lib/storage";
import { getTemplate } from "@/lib/templates";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

const emptyProduct: ProductFormValue = {
  name: "",
  sku: "",
  gtin: "",
  category: "tessile",
  data: {},
  images: [],
};

export function BrandWizard() {
  const navigate = useNavigate();
  const toast = useToast();
  const createOrg = useCreateOrg();
  const createProduct = useCreateProduct(null);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [vat, setVat] = useState("");
  const [org, setOrg] = useState<Organization | null>(null);
  const [product, setProduct] = useState<ProductFormValue>(emptyProduct);
  const updateOrg = useUpdateOrg(org?.id ?? null);

  const fields = getTemplate(product.category);

  const submitBrand = () => {
    createOrg.mutate(
      { name, vatNumber: vat },
      {
        onSuccess: (created) => {
          setOrg(created);
          setStep(2);
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  const handleLogo = async (file: File) => {
    if (!org) return;
    try {
      const url = await uploadPublicImage(`logos/${org.id}`, file);
      await updateOrg.mutateAsync({ logo_url: url });
      toast.success(t("common.saved"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const finish = () => {
    if (!org || !product.name) {
      navigate("/products");
      return;
    }
    createProduct.mutate(
      {
        name: product.name,
        sku: product.sku || null,
        gtin: product.gtin || null,
        category: product.category,
        data: product.data,
        images: product.images,
      },
      {
        onSuccess: () => navigate("/products"),
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <p className="text-sm text-gray-500">{t("onboarding.step", { current: step, total: 3 })}</p>

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t("onboarding.brandTitle")}</h2>
            <p className="text-sm text-gray-500">{t("onboarding.brandSubtitle")}</p>
          </div>
          <Input label={t("onboarding.brandName")} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t("onboarding.vatNumber")} value={vat} onChange={(e) => setVat(e.target.value)} />
          <Button disabled={!name} loading={createOrg.isPending} onClick={submitBrand}>
            {t("common.next")}
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t("onboarding.logoTitle")}</h2>
            <p className="text-sm text-gray-500">{t("onboarding.logoSubtitle")}</p>
          </div>
          {org?.logo_url ? (
            <img src={org.logo_url} alt="" className="h-20 w-20 rounded-lg object-cover" />
          ) : null}
          <FileUpload accept="image/*" label={t("common.upload")} onSelect={(file) => void handleLogo(file)} />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(3)}>
              {t("onboarding.skip")}
            </Button>
            <Button onClick={() => setStep(3)}>{t("common.next")}</Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t("onboarding.firstProductTitle")}</h2>
            <p className="text-sm text-gray-500">{t("onboarding.firstProductSubtitle")}</p>
          </div>
          <ProductForm
            value={product}
            fields={fields}
            onChange={setProduct}
            imagePrefix={`products/${org?.id ?? "draft"}`}
          />
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate("/products")}>
              {t("onboarding.skip")}
            </Button>
            <Button loading={createProduct.isPending} onClick={finish}>
              {t("onboarding.finish")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
