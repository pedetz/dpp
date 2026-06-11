import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, QrCode } from 'lucide-react'
import type { Product, ProductStatus } from '@passaporto/shared'
import { useProducts } from '@/hooks/useProducts'
import { useTemplates } from '@/hooks/useTemplates'
import { completeness } from '@/lib/conformity'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import t from '@/i18n/it.json'
import { Package } from 'lucide-react'

const PAGE_SIZE = 20

const statusOptions = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'draft', label: t.status_draft },
  { value: 'published', label: t.status_published },
  { value: 'archived', label: t.status_archived },
]

function StatusBadge({ status }: { status: ProductStatus }) {
  const labels: Record<ProductStatus, string> = {
    draft: t.status_draft,
    published: t.status_published,
    archived: t.status_archived,
  }
  return <Badge variant={status}>{labels[status]}</Badge>
}

function CompletenessCell({ product }: { product: Product }) {
  const { data: fields } = useTemplates(product.category)
  const pct = fields ? completeness(fields, product.data) : 0

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-green-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  )
}

export function ProductList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProductStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data: products, isLoading } = useProducts({
    status: status || undefined,
    search: search || undefined,
  })

  const paged = (products ?? []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil((products?.length ?? 0) / PAGE_SIZE)

  const columns = [
    {
      key: 'name',
      header: t.product_name,
      render: (p: Product) => (
        <span className="font-medium text-gray-900">{p.name}</span>
      ),
    },
    {
      key: 'sku',
      header: t.product_sku,
      render: (p: Product) => <span className="text-gray-500">{p.sku ?? '-'}</span>,
    },
    {
      key: 'category',
      header: t.product_category,
      render: (p: Product) => <span className="capitalize text-gray-600">{p.category}</span>,
    },
    {
      key: 'status',
      header: 'Stato',
      render: (p: Product) => <StatusBadge status={p.status} />,
    },
    {
      key: 'completeness',
      header: 'Completezza',
      render: (p: Product) => <CompletenessCell product={p} />,
    },
    {
      key: 'actions',
      header: '',
      render: (p: Product) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/products/${p.id}`)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Modifica"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(`/qr?product=${p.id}`)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="QR Code"
          >
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  if (!isLoading && (products ?? []).length === 0 && !search && !status) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="Nessun prodotto ancora"
        description="Crea il tuo primo prodotto digitale."
        action={
          <Button onClick={() => navigate('/products/new')}>{t.btn_new_product}</Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Cerca per nome..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="max-w-xs"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => { setStatus(e.target.value as ProductStatus | ''); setPage(0) }}
          className="w-44"
        />
      </div>

      <Table
        columns={columns}
        data={paged}
        loading={isLoading}
        keyExtractor={(p) => p.id}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Pagina {page + 1} di {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Precedente
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Successiva
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
