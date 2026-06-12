import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, QrCode, Settings, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const items: NavItem[] = [
  { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
  { to: "/products", label: t("nav.products"), icon: Package },
  { to: "/qr", label: t("nav.qr"), icon: QrCode },
  { to: "/settings", label: t("nav.settings"), icon: Settings },
  { to: "/settings/billing", label: t("nav.billing"), icon: CreditCard },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          P
        </div>
        <span className="text-lg font-semibold text-gray-900">{t("app.name")}</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/settings"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
