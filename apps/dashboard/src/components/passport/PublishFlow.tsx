import { useState } from "react";
import { Rocket } from "lucide-react";
import type { Product, TemplateField } from "@passaporto/shared";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { ConformityChecklist } from "@/components/fields/ConformityChecklist";
import { usePublish } from "@/hooks/usePassport";
import { isPublishable } from "@/lib/conformity";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

interface PublishFlowProps {
  product: Product;
  fields: TemplateField[];
  orgId: string | null;
}

export function PublishFlow({ product, fields, orgId }: PublishFlowProps) {
  const [open, setOpen] = useState(false);
  const [changelog, setChangelog] = useState("");
  const publish = usePublish(orgId);
  const toast = useToast();
  const canPublish = isPublishable(product, fields);
  const nextVersion = product.current_version + 1;

  const handle = () => {
    publish.mutate(
      { product, changelog },
      {
        onSuccess: () => {
          toast.success(t("passport.publishedToast"));
          setOpen(false);
          setChangelog("");
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <>
      <Button disabled={!canPublish} onClick={() => setOpen(true)}>
        <Rocket className="h-4 w-4" />
        {product.status === "published" ? t("passport.republish") : t("passport.publish")}
      </Button>
      {!canPublish ? (
        <p className="mt-1 text-xs text-red-600">{t("passport.publishBlocked")}</p>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("passport.publishTitle")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button loading={publish.isPending} onClick={handle}>
              {t("passport.publish")}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">
            {t("passport.publishBody", { version: nextVersion })}
          </p>
          <ConformityChecklist fields={fields} data={product.data} />
          <Textarea
            label={t("passport.changelogLabel")}
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}
