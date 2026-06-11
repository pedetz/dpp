import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct, useProducts } from '@/hooks/useProducts'
import { useTemplates } from '@/hooks/useTemplates'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
import { CertificationList } from '@/components/certifications/CertificationList'
import { CertificationUpload } from '@/components/certifications/CertificationUpload'
import { ConformityChecklist } from '@/components/fields/ConformityChecklist'
import { PublishFlow } from '@/components/passport/PublishFlow'
import { ArchiveFlow } from '@/components/passport/ArchiveFlow'
import { VersionHistory } from '@/components/passport/VersionHistory'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { ProductData, ProductStatus } from '@passaporto/shared'
import t from '@/i18n/it.json'

const statusLabels: Record<ProductStatus, string> = {
  draft: t.status_draft,
  published: t.status_published,
  archived: t.status_archived,
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: product, isLoading } = useProduct(id!)
  const { update } = useProducts()
  const { data: fields } = useTemplates(product?.category ?? '')
  const [showPublish, setShowPublish] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [showCertUpload, setShowCertUpload] = useState(false)

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!product) return <p className="text-gray-500">Prodotto non trovato.</p>

  const handleSave = async (values: {
    name: string
    sku: string
    gtin: string
    category: string
    data: ProductData
    images: string[]
  }) => {
    await update.mutateAsync({ id: product.id, ...values })
    toast('Prodotto aggiornato', 'success')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={product.sku ? `SKU: ${product.sku}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={product.status}>{statusLabels[product.status]}</Badge>
            {product.status !== 'archived' && (
              <Button variant="secondary" size="sm" onClick={() => setShowArchive(true)}>
                {t.btn_archive}
              </Button>
            )}
            {product.status !== 'published' && product.status !== 'archived' && (
              <Button size="sm" onClick={() => setShowPublish(true)}>
                {t.btn_publish}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Dati prodotto</h2>
            <ProductForm
              initial={product}
              onSave={handleSave}
              loading={update.isPending}
            />
          </Card>
        </div>

        <div className="space-y-6">
          {fields && (
            <Card>
              <ConformityChecklist fields={fields} data={product.data} />
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Certificazioni</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCertUpload(true)}>
                Aggiungi
              </Button>
            </div>
            <CertificationList productId={product.id} />
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Cronologia versioni</h2>
            <VersionHistory productId={product.id} />
          </Card>
        </div>
      </div>

      <PublishFlow product={product} open={showPublish} onClose={() => setShowPublish(false)} />
      <ArchiveFlow
        product={product}
        open={showArchive}
        onClose={() => setShowArchive(false)}
        onArchived={() => navigate('/products')}
      />

      <Modal open={showCertUpload} onClose={() => setShowCertUpload(false)} title="Aggiungi certificazione">
        <CertificationUpload productId={product.id} onSuccess={() => setShowCertUpload(false)} />
      </Modal>
    </div>
  )
}
