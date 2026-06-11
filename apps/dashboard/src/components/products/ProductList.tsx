import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import type { Product, ProductStatus as Status } from "@passaporto/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "./ProductCard";
import { t } from "@/i18n";

const PAGE_SIZE = 12;

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (status && product.status !== status) return false;
      if (category && product.category !== category) return false;
      if (!term) return true;
      const haystack = `${product.name} ${product.sku ?? ""} ${product.gtin ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [products, search, status, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Input
          className="min-w-[16rem] flex-1"
          placeholder={t("products.searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <Select
          placeholder={t("common.all")}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as Status | "");
            setPage(0);
          }}
          options={[
            { value: "draft", label: t("status.draft") },
            { value: "published", label: t("status.published") },
            { value: "archived", label: t("status.archived") },
          ]}
        />
        <Select
          placeholder={t("common.all")}
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Package}
          title={products.length === 0 ? t("products.empty") : t("products.emptyFiltered")}
          description={products.length === 0 ? t("products.emptyDescription") : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            {t("common.back")}
          </Button>
          <span className="text-sm text-gray-500">
            {current + 1} / {pageCount}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
