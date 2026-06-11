import { FileText, Trash2, ShieldCheck } from "lucide-react";
import type { Certification } from "@passaporto/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useCertifications,
  useDeleteCertification,
  signedCertUrl,
} from "@/hooks/useCertifications";
import { formatDate } from "@/lib/utils";
import { t } from "@/i18n";

function expiryBadge(validUntil: string | null) {
  if (!validUntil) return <Badge variant="neutral">{t("certifications.valid")}</Badge>;
  const days = (new Date(validUntil).getTime() - Date.now()) / 86_400_000;
  if (days < 0) return <Badge variant="danger">{t("certifications.expired")}</Badge>;
  if (days < 30) return <Badge variant="warning">{t("certifications.expiringSoon")}</Badge>;
  return <Badge variant="success">{t("certifications.valid")}</Badge>;
}

export function CertificationList({ productId }: { productId: string }) {
  const { data, isLoading } = useCertifications(productId);
  const remove = useDeleteCertification(productId);

  const open = async (path: string) => {
    const url = await signedCertUrl(path);
    if (url) window.open(url, "_blank", "noopener");
  };

  if (isLoading) return <p className="text-sm text-gray-500">{t("common.loading")}</p>;

  if (!data || data.length === 0) {
    return (
      <EmptyState icon={ShieldCheck} title={t("certifications.empty")} />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {data.map((cert: Certification) => (
        <li
          key={cert.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
        >
          <button
            type="button"
            onClick={() => void open(cert.file_path)}
            className="flex items-center gap-3 text-left"
          >
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{cert.kind}</p>
              <p className="text-xs text-gray-500">
                {t("certifications.validUntil")}: {formatDate(cert.valid_until)}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {expiryBadge(cert.valid_until)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(t("certifications.deleteConfirm"))) remove.mutate(cert);
              }}
              aria-label={t("common.delete")}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
