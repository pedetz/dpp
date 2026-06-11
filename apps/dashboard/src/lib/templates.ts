import type { TemplateField } from "@passaporto/shared";

export const textileTemplate: TemplateField[] = [
  { key: "composizione", label_it: "Composizione fibre", type: "composition", required: true },
  { key: "paese_tessitura", label_it: "Paese di tessitura", type: "country", required: true },
  { key: "paese_confezione", label_it: "Paese di confezione", type: "country", required: true },
  { key: "contenuto_riciclato", label_it: "Contenuto riciclato (%)", type: "percent", required: false },
  { key: "istruzioni_cura", label_it: "Istruzioni di cura", type: "care_symbols", required: true },
  { key: "smaltimento", label_it: "Istruzioni fine vita", type: "textarea", required: true },
  { key: "svhc", label_it: "Sostanze SVHC dichiarate", type: "textarea", required: false },
  { key: "durabilita", label_it: "Note su durabilità e riparabilità", type: "textarea", required: false },
];

export const templatesByCategory: Record<string, TemplateField[]> = {
  tessile: textileTemplate,
};

export function getTemplate(category: string): TemplateField[] {
  return templatesByCategory[category] ?? textileTemplate;
}
