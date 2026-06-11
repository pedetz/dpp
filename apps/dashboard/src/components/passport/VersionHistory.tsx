import { useState } from "react";
import { History } from "lucide-react";
import type { PassportVersion } from "@passaporto/shared";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useVersions } from "@/hooks/usePassport";
import { diffData } from "@/lib/diff";
import type { DiffEntry } from "@/lib/diff";
import { formatDate } from "@/lib/utils";
import { t } from "@/i18n";

function diffVariant(kind: DiffEntry["kind"]) {
  if (kind === "added") return "success" as const;
  if (kind === "removed") return "danger" as const;
  return "warning" as const;
}

function diffLabel(kind: DiffEntry["kind"]) {
  if (kind === "added") return t("passport.diffAdded");
  if (kind === "removed") return t("passport.diffRemoved");
  return t("passport.diffChanged");
}

export function VersionHistory({ productId }: { productId: string }) {
  const { data, isLoading } = useVersions(productId);
  const [openVersion, setOpenVersion] = useState<number | null>(null);

  if (isLoading) return <p className="text-sm text-gray-500">{t("common.loading")}</p>;

  if (!data || data.length === 0) {
    return <EmptyState icon={History} title={t("passport.noVersions")} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((version: PassportVersion, index) => {
        const previous = data[index + 1];
        const entries = previous ? diffData(previous.data, version.data) : [];
        const expanded = openVersion === version.version;
        return (
          <li key={version.version} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t("products.version", { version: version.version })}
                </p>
                <p className="text-xs text-gray-500">
                  {t("passport.publishedAt")} {formatDate(version.published_at)}
                </p>
              </div>
              {entries.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenVersion(expanded ? null : version.version)}
                >
                  {t("passport.viewDiff")}
                </Button>
              ) : null}
            </div>
            {expanded ? (
              <ul className="mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
                {entries.map((entry) => (
                  <li key={entry.key} className="flex items-center gap-2 text-sm">
                    <Badge variant={diffVariant(entry.kind)}>{diffLabel(entry.kind)}</Badge>
                    <span className="text-gray-700">{entry.key}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
