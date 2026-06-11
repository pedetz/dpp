import type { TemplateField } from "@passaporto/shared";
import { getTemplate } from "@/lib/templates";

export function useTemplate(category: string): TemplateField[] {
  return getTemplate(category);
}
