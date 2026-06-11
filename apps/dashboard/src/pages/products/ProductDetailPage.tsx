import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, QrCode } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { ProductStatus } from "@/components/products/ProductStatus";
import { ProductForm } from "@/components/products/ProductForm";
import type { ProductFormValue } from "@/components/products/ProductForm";
import { ConformityChecklist } from "@/components/fields/ConformityChecklist";
import { CertificationList } from "@/components/certifications/CertificationList";
import { CertificationUpload } from "@/components/certifications/CertificationUpload";
import { PublishFlow } from "@/components/passport/PublishFlow";
import { ArchiveFlow } from "@/components/passport/ArchiveFlow";
import { VersionHistory } from "@/components/passport/VersionHistory";
import { useOrg } from "@/hooks/useOrg";
import { useProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { getTemplate } from "@/lib/templates";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

function toFormValue(name: string, sku: string | null, gtin: string | null, category: string, data: Record<string, unknown>, images: string[]): ProductFormValue {
  return { name, sku: sku ?? "", gtin: gtin ?? "", category, data, images };
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { orgId } = useOrg();
  const { data: product, isLoading } = useProduct(id);
  const update = useUpdateProduct(orgId);
  const remove = useDeleteProduct(orgId);

  const [form, setForm] = useState<ProductFormValue | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    setForm(
      toFormValue(
        product.name,
        product.sku,
        product.gtin,
        product.category,
        product.data,
        product.images,
      ),
    );
  }, [product]);

  if (isLoading || !product || !form) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const fields = getTemplate(form.category);

  const save = () => {
    update.mutate(
      {
        id: product.id,
        patch: {
          name: form.name,
          sku: form.sku || null,
          gtin: form.gtin || null,
          category: form.category,
          data: form.data,
          images: form.images,
        },
      },
      {
        onSuccess: () => toast.success(t("products.updatedToast")),
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  const confirmDelete = () => {
    remove.mutate(product.id, {
      onSuccess: () => {
        toast.success(t("products.deletedToast"));
        navigate("/products");
      },
      onError: () => toast.error(t("common.error")),
    });
  };

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={t("products.version", { version: product.current_version })}
        actions={
          <>
            <ProductStatus status={product.status} />
            <Button variant="secondary" onClick={() => navigate(`/qr?product=${product.id}`)}>
              <QrCode className="h-4 w-4" />
              {t("qr.title")}
            </Button>
            <Button variant="ghost" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">{t("products.editTitle")}</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-6">
              <ProductForm
                value={form}
                fields={fields}
                onChange={setForm}
                imagePrefix={`products/${product.id}`}
              />
              <div className="flex justify-end">
                <Button loading={update.isPending} onClick={save}>
                  {t("common.save")}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">{t("certifications.title")}</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <CertificationList productId={product.id} />
              <CertificationUpload productId={product.id} />
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">{t("fields.conformityTitle")}</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <ConformityChecklist fields={fields} data={form.data} />
              <PublishFlow product={{ ...product, data: form.data, name: form.name }} fields={fields} orgId={orgId} />
              <ArchiveFlow product={product} orgId={orgId} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">{t("passport.versionHistory")}</h2>
            </CardHeader>
            <CardBody>
              <VersionHistory productId={product.id} />
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("products.deleteConfirm")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={remove.isPending} onClick={confirmDelete}>
              {t("common.delete")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">{t("products.deleteConfirmBody")}</p>
      </Modal>
    </div>
  );
}
