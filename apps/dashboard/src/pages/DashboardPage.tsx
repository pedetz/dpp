import { useNavigate } from "react-router-dom";
import { Package, QrCode, FileText, CheckCircle } from "lucide-react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { ProductCard } from "@/components/products/ProductCard";
import { useOrg } from "@/hooks/useOrg";
import { useProducts } from "@/hooks/useProducts";
import { useSubscription } from "@/hooks/useBilling";
import { getPlan } from "@/lib/plans";
import { t } from "@/i18n";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { org, orgId } = useOrg();
  const { data: products, isLoading } = useProducts(orgId);
  const subscription = useSubscription(orgId);

  const plan = subscription.data?.plan ?? org?.plan ?? "trial";
  const limits = getPlan(plan);

  const total = products?.length ?? 0;
  const published = products?.filter((p) => p.status === "published").length ?? 0;
  const drafts = products?.filter((p) => p.status === "draft").length ?? 0;

  const usagePct =
    limits.maxProducts === Number.POSITIVE_INFINITY
      ? 100
      : Math.round((total / limits.maxProducts) * 100);

  const recent = products?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("dashboard.welcomeTitle", { org: org?.name ?? "" })}
        subtitle={t("dashboard.welcomeSubtitle")}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label={t("dashboard.totalProducts")}
          value={total}
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          label={t("dashboard.publishedPassports")}
          value={published}
        />
        <StatCard
          icon={<FileText className="h-6 w-6" />}
          label={t("dashboard.draftProducts")}
          value={drafts}
        />
      </div>

      {/* Plan usage */}
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{t("dashboard.planUsage")}</p>
            <p className="text-sm text-gray-500">
              {t("dashboard.planUsageCount", {
                current: total,
                limit:
                  limits.maxProducts === Number.POSITIVE_INFINITY
                    ? "∞"
                    : limits.maxProducts,
              })}
            </p>
          </div>
          <ProgressBar value={usagePct} />
        </CardBody>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          {t("dashboard.quickActions")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/products/new")}>
            <Package className="h-4 w-4" />
            {t("dashboard.addProduct")}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/qr")}>
            <QrCode className="h-4 w-4" />
            {t("dashboard.generateQr")}
          </Button>
        </div>
      </div>

      {/* Recent products */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          {t("dashboard.recentProducts")}
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-sm text-gray-500">{t("dashboard.noProducts")}</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recent.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
