import type { Product } from "@passaporto/shared";

const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;

export function passportUrl(product: Pick<Product, "gtin" | "slug">): string {
  if (product.gtin) return `${appUrl}/01/${product.gtin}`;
  return `${appUrl}/p/${product.slug}`;
}
