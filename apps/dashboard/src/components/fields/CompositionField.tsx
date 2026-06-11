import { Plus, Trash2 } from "lucide-react";
import type { FiberEntry } from "@passaporto/shared";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

interface CompositionFieldProps {
  value: FiberEntry[];
  onChange: (value: FiberEntry[]) => void;
}

export function CompositionField({ value, onChange }: CompositionFieldProps) {
  const sum = value.reduce((acc, entry) => acc + (Number(entry.percent) || 0), 0);
  const valid = sum === 100;

  const update = (index: number, patch: Partial<FiberEntry>) => {
    onChange(value.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...value, { fiber: "", percent: 0 }]);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.map((entry, index) => (
        <div key={index} className="flex items-end gap-2">
          <Input
            className="flex-1"
            placeholder={t("fields.fiber")}
            value={entry.fiber}
            onChange={(e) => update(index, { fiber: e.target.value })}
          />
          <Input
            type="number"
            min={0}
            max={100}
            className="w-24"
            placeholder={t("fields.percent")}
            value={entry.percent}
            onChange={(e) => update(index, { percent: Number(e.target.value) })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            aria-label={t("common.remove")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />
          {t("fields.addFiber")}
        </Button>
        <span
          className={cn(
            "text-sm font-medium",
            valid ? "text-green-600" : "text-red-600",
          )}
        >
          {valid ? t("fields.fiberSumOk") : t("fields.fiberSum", { sum })}
        </span>
      </div>
      {!valid ? (
        <span className="text-xs text-red-600">{t("fields.fiberSumError")}</span>
      ) : null}
    </div>
  );
}
