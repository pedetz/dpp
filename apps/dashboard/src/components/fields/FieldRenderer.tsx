import type { FiberEntry, TemplateField } from "@passaporto/shared";
import { Textarea } from "@/components/ui/Textarea";
import { CompositionField } from "./CompositionField";
import { CountryField } from "./CountryField";
import { PercentField } from "./PercentField";
import { CareSymbolsField } from "./CareSymbolsField";
import { t } from "@/i18n";

interface FieldRendererProps {
  field: TemplateField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function asFibers(value: unknown): FiberEntry[] {
  return Array.isArray(value) ? (value as FiberEntry[]) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const label = (
    <span className="text-sm font-medium text-gray-700">
      {field.label_it}
      {field.required ? <span className="ml-1 text-red-500">*</span> : null}
    </span>
  );

  if (field.type === "composition") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <CompositionField value={asFibers(value)} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "country") {
    return (
      <div className="flex flex-col gap-1">
        {label}
        <CountryField value={typeof value === "string" ? value : ""} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "percent") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <PercentField value={typeof value === "number" ? value : 0} onChange={onChange} />
      </div>
    );
  }

  if (field.type === "care_symbols") {
    return (
      <div className="flex flex-col gap-2">
        {label}
        <CareSymbolsField value={asStringArray(value)} onChange={onChange} />
      </div>
    );
  }

  return (
    <Textarea
      label={`${field.label_it}${field.required ? " *" : ""}`}
      placeholder={t("common.optional")}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
