import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { QRCodeDisplay } from '@/components/qr/QRCode'
import { QRDownload } from '@/components/qr/QRDownload'
import { EmptyState } from '@/components/ui/EmptyState'
import { QrCode } from 'lucide-react'
import t from '@/i18n/it.json'

export default function QRPage() {
  const [searchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(searchParams.get('product') ?? '')
  const { data: products } = useProducts({ status: 'published' })

  const options = (products ?? []).map((p) => ({ value: p.id, label: p.name }))
  const product = (products ?? []).find((p) => p.id === selectedId)

  return (
    <div>
      <PageHeader title={t.qr_title} />

      <Card className="max-w-lg space-y-6">
        <Select
          label={t.labels_select}
          options={options}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          placeholder="Seleziona prodotto pubblicato"
        />

        {product ? (
          <div className="flex flex-col items-center gap-4">
            <QRCodeDisplay product={product} />
            <QRDownload product={product} />
          </div>
        ) : (
          <EmptyState
            icon={<QrCode className="h-10 w-10" />}
            title="Seleziona un prodotto"
            description="Scegli un prodotto pubblicato per generare il QR Code."
          />
        )}
      </Card>
    </div>
  )
}
