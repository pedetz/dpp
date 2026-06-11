import { useState } from "react";
import { Archive, ArchiveRestore } from "lucide-react";
import type { Product } from "@passaporto/shared";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useSetProductStatus } from "@/hooks/useProducts";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

interface ArchiveFlowProps {
  product: Product;
  orgId: string | null;
}

export function ArchiveFlow({ product, orgId }: ArchiveFlowProps) {
  const [open, setOpen] = useState(false);
  const setStatus = useSetProductStatus(orgId);
  const toast = useToast();
  const archived = product.status === "archived";

  const handle = () => {
    setStatus.mutate(
      { id: product.id, status: archived ? "draft" : "archived" },
      {
        onSuccess: () => {
          toast.success(t("passport.archivedToast"));
          setOpen(false);
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  if (archived) {
    return (
      <Button variant="secondary" loading={setStatus.isPending} onClick={handle}>
        <ArchiveRestore className="h-4 w-4" />
        {t("passport.unarchive")}
      </Button>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Archive className="h-4 w-4" />
        {t("passport.archive")}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("passport.archiveTitle")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" loading={setStatus.isPending} onClick={handle}>
              {t("passport.archive")}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">{t("passport.archiveBody")}</p>
      </Modal>
    </>
  );
}
