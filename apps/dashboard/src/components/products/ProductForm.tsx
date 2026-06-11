import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import type { Product, ProductData } from '@passaporto/shared'
import { useTemplates } from '@/hooks/useTemplates'
import { FieldRenderer } from '@/components/fields/FieldRenderer'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import t from '@/i18n/it.json'

const CATEGORIES = [
  { value: 'tessile', label: 'Tessile' },
]

interface ProductFormProps {
  initial?: Partial<Product>
  onSave: (values: {
    name: string
    sku: string
    gtin: string
    category: string
    data: ProductData
    images: string[]
  }) => Promise<void>
  loading?: boolean
}

export function ProductForm({ initial, onSave, loading }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [sku, setSku] = useState(initial?.sku ?? '')
  const [gtin, setGtin] = useState(initial?.gtin ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'tessile')
  const [data, setData] = useState<ProductData>(initial?.data ?? {})
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: fields } = useTemplates(category)

  const setField = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Campo obbligatorio'
    if (!category) errs.category = 'Campo obbligatorio'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSave({ name, sku, gtin, category, data, images })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const path = `products/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('images').upload(path, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(path)
      setImages((prev) => [...prev, urlData.publicUrl])
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t.product_name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label={t.product_sku}
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <Input
          label={t.product_gtin}
          value={gtin}
          onChange={(e) => setGtin(e.target.value)}
        />
        <Select
          label={t.product_category}
          options={CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
        />
      </div>

      {fields && fields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Dati passaporto
          </h3>
          {fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              data={data}
              onChange={setField}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{t.product_images}</label>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative">
              <img src={url} alt="" className="h-20 w-20 rounded-md object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 rounded-full bg-red-600 p-0.5 text-white hover:bg-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
            {uploadingImage ? (
              <div className="animate-spin h-5 w-5 border-2 border-green-500 rounded-full border-t-transparent" />
            ) : (
              <Upload className="h-6 w-6 text-gray-400" />
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {t.btn_save}
        </Button>
      </div>
    </form>
  )
}
