import { useState } from "react";
import { Download } from "lucide-react";
import type { Product } from "@passaporto/shared";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

const functionsUrl = import.meta.env.VITE_EDGE_FUNCTIONS_URL;

const formats = ["a4_3x8", "a4_2x7", "a4_2x4"] as const;
type SheetFormat = (typeof formats)[number];

interface LabelSheetConfigProps {
  products: Product[];
}

export function LabelSheetConfig({ products }: LabelSheetConfigProps) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [format, setFormat] = useState<SheetFormat>("a4_3x8");
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generate = async () => {
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch(`${functionsUrl}/generate-labels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productIds: Array.from(selected), format }),
      });
      if (!response.ok) throw new Error("failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "etichette.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Select
        label={t("qr.sheetFormat")}
        value={format}
        onChange={(e) => setFormat(e.target.value as SheetFormat)}
        options={formats.map((value) => ({ value, label: t(`qr.format.${value}`) }))}
      />
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          {t("qr.selectProducts")} · {t("qr.selected", { count: selected.size })}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm",
                selected.has(product.id)
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 hover:bg-gray-50",
              )}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>
      <Button
        disabled={selected.size === 0}
        loading={busy}
        onClick={() => void generate()}
      >
        <Download className="h-4 w-4" />
        {t("qr.downloadZip")}
      </Button>
    </div>
  );
}
