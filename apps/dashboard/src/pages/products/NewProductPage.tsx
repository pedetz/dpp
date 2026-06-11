import { useNavigate } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductForm } from '@/components/products/ProductForm'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

export default function NewProductPage() {
  const navigate = useNavigate()
  const { create } = useProducts()
  const { toast } = useToast()

  const handleSave = async (values: Parameters<typeof create.mutateAsync>[0]) => {
    const product = await create.mutateAsync(values)
    toast('Prodotto creato con successo', 'success')
    navigate(`/products/${product.id}`)
  }

  return (
    <div>
      <PageHeader title="Nuovo prodotto" subtitle="Crea un nuovo passaporto digitale." />
      <Card>
        <ProductForm onSave={handleSave} loading={create.isPending} />
      </Card>
    </div>
  )
}
