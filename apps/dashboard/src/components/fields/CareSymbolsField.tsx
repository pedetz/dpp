import { careSymbols } from "@/lib/careSymbols";
import { cn } from "@/lib/utils";

interface CareSymbolsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function CareSymbolsField({ value, onChange }: CareSymbolsFieldProps) {
  const toggle = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((v) => v !== key));
      return;
    }
    onChange([...value, key]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {careSymbols.map((symbol) => {
        const active = value.includes(symbol.key);
        return (
          <button
            key={symbol.key}
            type="button"
            onClick={() => toggle(symbol.key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
            )}
          >
            {symbol.label_it}
          </button>
        );
      })}
    </div>
  );
}
