import { CheckCircle2, XCircle } from "lucide-react";
import type { ProductData, TemplateField } from "@passaporto/shared";
import { Badge } from "@/components/ui/Badge";
import { missingRequiredFields } from "@/lib/conformity";
import { t } from "@/i18n";

interface ConformityChecklistProps {
  fields: TemplateField[];
  data: ProductData;
}

export function ConformityChecklist({ fields, data }: ConformityChecklistProps) {
  const missing = missingRequiredFields(fields, data);

  if (missing.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
        <CheckCircle2 className="h-5 w-5" />
        {t("fields.conformityOk")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-red-50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-red-700">
        <XCircle className="h-5 w-5" />
        {t("fields.conformityMissing")}
        <Badge variant="danger">{missing.length}</Badge>
      </div>
      <ul className="flex flex-col gap-1 pl-7 text-sm text-red-600">
        {missing.map((field) => (
          <li key={field.key}>{t("fields.missingField", { field: field.label_it })}</li>
        ))}
      </ul>
    </div>
  );
}
