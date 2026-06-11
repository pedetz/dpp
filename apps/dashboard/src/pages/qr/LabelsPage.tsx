import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase'
import t from '@/i18n/it.json'
import type { Product } from '@passaporto/shared'

const FORMAT_OPTIONS = [
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
  { value: 'L7160', label: 'Foglio etichette L7160 (21×38mm)' },
  { value: 'L7163', label: 'Foglio etichette L7163 (99×38mm)' },
]

export default function LabelsPage() {
  const { data: products } = useProducts({ status: 'published' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [format, setFormat] = useState('A4')
  const [loading, setLoading] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelected(new Set((products ?? []).map((p) => p.id)))
  const clearAll = () => setSelected(new Set())

  const handleDownload = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-labels', {
        body: { productIds: Array.from(selected), format },
      })
      if (error) throw error
      if (data?.url) window.open(data.url, '_blank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title={t.labels_title} />

      <div className="space-y-6 max-w-2xl">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{t.labels_select}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>Tutti</Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>Nessuno</Button>
            </div>
          </div>

          {(products ?? []).length === 0 ? (
            <p className="text-sm text-gray-500">Nessun prodotto pubblicato.</p>
          ) : (
            <div className="space-y-2">
              {(products ?? []).map((p: Product) => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{p.name}</span>
                  {p.gtin && <span className="text-xs text-gray-400">{p.gtin}</span>}
                </label>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium text-gray-900">{t.labels_format}</h3>
          <Select
            options={FORMAT_OPTIONS}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="max-w-xs"
          />
        </Card>

        <Button
          disabled={selected.size === 0}
          loading={loading}
          onClick={handleDownload}
        >
          {t.btn_download} etichette ({selected.size})
        </Button>
      </div>
    </div>
  )
}
