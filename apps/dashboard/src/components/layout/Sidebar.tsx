import { NavLink } from 'react-router-dom'
import { Package, QrCode, Tag, Settings, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { useOrg } from '@/hooks/useOrg'
import t from '@/i18n/it.json'
import type { Plan } from '@passaporto/shared'

const navItems = [
  { to: '/products', label: t.nav_products, icon: Package },
  { to: '/qr', label: t.nav_qr, icon: QrCode },
  { to: '/labels', label: t.nav_labels, icon: Tag },
  { to: '/settings', label: t.nav_settings, icon: Settings },
  { to: '/settings/billing', label: t.nav_billing, icon: CreditCard },
]

const planLabelMap: Record<Plan, string> = {
  trial: t.plan_trial,
  starter: t.plan_starter,
  pro: t.plan_pro,
  filiera: t.plan_filiera,
}

export function Sidebar() {
  const { org } = useOrg()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <span className="text-lg font-bold text-green-700">Passaporto</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {org && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge variant={org.plan as Plan}>{planLabelMap[org.plan]}</Badge>
            <span className="truncate text-xs text-gray-500">{org.name}</span>
          </div>
        </div>
      )}
    </aside>
  )
}
