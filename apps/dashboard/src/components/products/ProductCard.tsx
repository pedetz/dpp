import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import type { Product } from "@passaporto/shared";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProductStatus } from "./ProductStatus";
import { completeness } from "@/lib/conformity";
import { getTemplate } from "@/lib/templates";
import { t } from "@/i18n";

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const fields = getTemplate(product.category);
  const score = completeness(fields, product.data);
  const cover = product.images[0];

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-t-xl bg-gray-100">
        {cover ? (
          <img src={cover} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-gray-300" />
        )}
      </div>
      <CardBody className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <ProductStatus status={product.status} />
        </div>
        <p className="text-xs text-gray-500">{product.sku ?? product.gtin ?? "-"}</p>
        <div className="mt-1">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>{t("products.completeness")}</span>
            <span>{score}%</span>
          </div>
          <ProgressBar value={score} />
        </div>
      </CardBody>
    </Card>
  );
}
