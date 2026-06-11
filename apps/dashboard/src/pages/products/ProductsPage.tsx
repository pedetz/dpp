import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { ProductList } from '@/components/products/ProductList'
import { ImportCSV } from '@/components/products/ImportCSV'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import t from '@/i18n/it.json'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [showImport, setShowImport] = useState(false)

  return (
    <div>
      <PageHeader
        title={t.nav_products}
        subtitle="Gestisci i tuoi prodotti e i passaporti digitali."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowImport(true)}>
              {t.btn_import}
            </Button>
            <Button onClick={() => navigate('/products/new')}>
              <Plus className="h-4 w-4" />
              {t.btn_new_product}
            </Button>
          </>
        }
      />

      <ProductList />

      <Modal open={showImport} onClose={() => setShowImport(false)} title={t.btn_import}>
        <ImportCSV onDone={() => setShowImport(false)} />
      </Modal>
    </div>
  )
}
