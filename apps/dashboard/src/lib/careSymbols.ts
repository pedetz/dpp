export interface CareSymbol {
  key: string;
  label_it: string;
}

export const careSymbols: CareSymbol[] = [
  { key: "wash_30", label_it: "Lavaggio max 30°C" },
  { key: "wash_40", label_it: "Lavaggio max 40°C" },
  { key: "wash_60", label_it: "Lavaggio max 60°C" },
  { key: "hand_wash", label_it: "Lavaggio a mano" },
  { key: "no_wash", label_it: "Non lavare" },
  { key: "bleach_no", label_it: "Non candeggiare" },
  { key: "tumble_low", label_it: "Asciugatura a bassa temperatura" },
  { key: "tumble_no", label_it: "Non asciugare in asciugatrice" },
  { key: "iron_low", label_it: "Stirare a bassa temperatura" },
  { key: "iron_medium", label_it: "Stirare a media temperatura" },
  { key: "iron_no", label_it: "Non stirare" },
  { key: "dryclean_p", label_it: "Lavaggio a secco (P)" },
  { key: "dryclean_no", label_it: "Non lavare a secco" },
];

export function careSymbolLabel(key: string): string {
  return careSymbols.find((s) => s.key === key)?.label_it ?? key;
}
