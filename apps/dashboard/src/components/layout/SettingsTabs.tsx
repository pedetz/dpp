import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { t } from "@/i18n";

const tabs = [
  { to: "/settings", label: t("settings.brandTab"), end: true },
  { to: "/settings/members", label: t("settings.membersTab"), end: false },
  { to: "/settings/billing", label: t("settings.billingTab"), end: false },
];

export function SettingsTabs() {
  return (
    <div className="mb-6 flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              isActive
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
