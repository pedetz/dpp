import type { Product, ProductData, TemplateField } from "@passaporto/shared";

function isFieldFilled(field: TemplateField, value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (field.type === "composition" && Array.isArray(value)) return value.length > 0;
  if (field.type === "care_symbols" && Array.isArray(value)) return value.length > 0;
  return true;
}

export function missingRequiredFields(
  fields: TemplateField[],
  data: ProductData,
): TemplateField[] {
  return fields.filter((field) => field.required && !isFieldFilled(field, data[field.key]));
}

export function completeness(fields: TemplateField[], data: ProductData): number {
  if (fields.length === 0) return 100;
  const filled = fields.filter((field) => isFieldFilled(field, data[field.key])).length;
  return Math.round((filled / fields.length) * 100);
}

export function isPublishable(
  product: Pick<Product, "name" | "category" | "data">,
  fields: TemplateField[],
): boolean {
  if (!product.name || !product.category) return false;
  return missingRequiredFields(fields, product.data).length === 0;
}
