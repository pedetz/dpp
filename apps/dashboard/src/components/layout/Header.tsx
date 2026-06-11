import { ChevronDown, LogOut, Building2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { Avatar } from "@/components/ui/Avatar";
import { DropdownMenu, DropdownItem } from "@/components/ui/DropdownMenu";
import { PlanBadge } from "@/components/billing/PlanBadge";
import { t } from "@/i18n";

export function Header() {
  const { user, signOut } = useAuth();
  const { org, orgs, switchOrg } = useOrg();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <DropdownMenu
        align="left"
        trigger={
          <span className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
            <Avatar name={org?.name ?? "?"} src={org?.logo_url} />
            <span className="text-sm font-medium text-gray-900">{org?.name}</span>
            {org ? <PlanBadge plan={org.plan} /> : null}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        }
      >
        {orgs.map((item) => (
          <DropdownItem key={item.id} onSelect={() => switchOrg(item.id)}>
            <Building2 className="h-4 w-4" />
            {item.name}
          </DropdownItem>
        ))}
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <span className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50">
            <Avatar name={user?.email ?? "?"} />
            <span className="hidden text-sm text-gray-700 sm:inline">{user?.email}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        }
      >
        <DropdownItem onSelect={() => navigate("/settings/members")}>
          <Users className="h-4 w-4" />
          {t("nav.members")}
        </DropdownItem>
        <DropdownItem onSelect={() => void signOut()} danger>
          <LogOut className="h-4 w-4" />
          {t("auth.logout")}
        </DropdownItem>
      </DropdownMenu>
    </header>
  );
}
