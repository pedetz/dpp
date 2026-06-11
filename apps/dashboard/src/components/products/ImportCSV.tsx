import { useMemo, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import type { ProductData, TemplateField } from "@passaporto/shared";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FileUpload } from "@/components/ui/FileUpload";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { parseCsv } from "@/lib/csv";
import type { ParsedCsv } from "@/lib/csv";
import type { NewProductInput } from "@/hooks/useProducts";
import { t } from "@/i18n";

type Step = "upload" | "map" | "preview" | "result";

interface TargetOption {
  value: string;
  label: string;
}

interface ImportResult {
  imported: number;
  errors: { row: number; message: string }[];
}

interface ImportCSVProps {
  fields: TemplateField[];
  category: string;
  onImport: (rows: NewProductInput[]) => Promise<void>;
}

const baseTargets: TargetOption[] = [
  { value: "name", label: "name" },
  { value: "sku", label: "sku" },
  { value: "gtin", label: "gtin" },
];

export function ImportCSV({ fields, category, onImport }: ImportCSVProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const targets = useMemo<TargetOption[]>(
    () => [...baseTargets, ...fields.map((f) => ({ value: f.key, label: f.label_it }))],
    [fields],
  );

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const csv = parseCsv(String(reader.result));
      setParsed(csv);
      setMapping({});
      setStep("map");
    };
    reader.readAsText(file);
  };

  const buildRows = (): NewProductInput[] => {
    if (!parsed) return [];
    return parsed.rows.map((row) => {
      const data: ProductData = {};
      let name = "";
      let sku: string | null = null;
      let gtin: string | null = null;
      Object.entries(mapping).forEach(([index, target]) => {
        const cell = row[Number(index)] ?? "";
        if (target === "name") name = cell;
        else if (target === "sku") sku = cell || null;
        else if (target === "gtin") gtin = cell || null;
        else if (target) data[target] = cell;
      });
      return { name, sku, gtin, category, data, images: [] };
    });
  };

  const validateRow = (input: NewProductInput): string | null => {
    if (!input.name) return t("csv.errorRequired", { field: "name" });
    return null;
  };

  const runImport = async () => {
    const rows = buildRows();
    const errors: { row: number; message: string }[] = [];
    const valid: NewProductInput[] = [];
    rows.forEach((row, index) => {
      const error = validateRow(row);
      if (error) {
        errors.push({ row: index + 2, message: error });
        return;
      }
      valid.push(row);
    });
    setBusy(true);
    try {
      if (valid.length > 0) await onImport(valid);
      setResult({ imported: valid.length, errors });
      setStep("result");
    } finally {
      setBusy(false);
    }
  };

  if (step === "upload") {
    return (
      <FileUpload accept=".csv,text/csv" label={t("csv.selectFile")} onSelect={handleFile} />
    );
  }

  if (step === "map" && parsed) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{t("csv.mapColumns")}</p>
        <div className="flex flex-col gap-2">
          {parsed.headers.map((header, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-40 text-sm font-medium text-gray-700">{header}</span>
              <Select
                placeholder={t("csv.ignore")}
                value={mapping[index] ?? ""}
                onChange={(e) =>
                  setMapping((prev) => ({ ...prev, [index]: e.target.value }))
                }
                options={targets}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setStep("preview")}>{t("common.next")}</Button>
        </div>
      </div>
    );
  }

  if (step === "preview" && parsed) {
    const rows = buildRows();
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{t("csv.preview", { count: rows.length })}</p>
        <Table>
          <THead>
            <TR>
              <TH>{t("products.name")}</TH>
              <TH>{t("products.sku")}</TH>
              <TH>{t("products.gtin")}</TH>
            </TR>
          </THead>
          <TBody>
            {rows.slice(0, 8).map((row, index) => (
              <TR key={index}>
                <TD>{row.name || "-"}</TD>
                <TD>{row.sku ?? "-"}</TD>
                <TD>{row.gtin ?? "-"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setStep("map")}>
            {t("common.back")}
          </Button>
          <Button loading={busy} onClick={() => void runImport()}>
            {t("csv.import", { count: rows.length })}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-brand-600" />
          <span className="font-medium text-gray-900">{t("csv.result")}</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="success">{t("csv.imported", { count: result.imported })}</Badge>
          {result.errors.length > 0 ? (
            <Badge variant="danger">{t("csv.failed", { count: result.errors.length })}</Badge>
          ) : null}
        </div>
        {result.errors.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-red-600">
            {result.errors.map((error) => (
              <li key={error.row}>
                {t("csv.rowError", { row: error.row, error: error.message })}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return null;
}
