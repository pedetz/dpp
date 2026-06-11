import type { Product } from '@passaporto/shared'
import { useProducts } from '@/hooks/useProducts'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import t from '@/i18n/it.json'

interface ArchiveFlowProps {
  product: Product
  open: boolean
  onClose: () => void
  onArchived?: () => void
}

export function ArchiveFlow({ product, open, onClose, onArchived }: ArchiveFlowProps) {
  const { archive } = useProducts()

  const handleArchive = async () => {
    await archive.mutateAsync(product.id)
    onClose()
    onArchived?.()
  }

  return (
    <Modal open={open} onClose={onClose} title="Archivia prodotto">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Stai per archiviare <strong>{product.name}</strong>. Il passaporto non sarà più accessibile pubblicamente.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Annulla</Button>
          <Button variant="danger" loading={archive.isPending} onClick={handleArchive}>
            {t.btn_archive}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
