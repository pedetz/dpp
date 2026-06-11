import type { Product } from '@passaporto/shared'
import { useTemplates } from '@/hooks/useTemplates'
import { useProducts } from '@/hooks/useProducts'
import { missingRequiredFields } from '@/lib/conformity'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConformityChecklist } from '@/components/fields/ConformityChecklist'
import t from '@/i18n/it.json'

interface PublishFlowProps {
  product: Product
  open: boolean
  onClose: () => void
}

export function PublishFlow({ product, open, onClose }: PublishFlowProps) {
  const { data: fields } = useTemplates(product.category)
  const { publish } = useProducts()

  const missing = fields ? missingRequiredFields(fields, product.data) : []
  const canPublish = missing.length === 0

  const handlePublish = async () => {
    await publish.mutateAsync(product.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t.publish_confirm}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{t.publish_warning}</p>

        {fields && <ConformityChecklist fields={fields} data={product.data} />}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Annulla</Button>
          <Button
            disabled={!canPublish}
            loading={publish.isPending}
            onClick={handlePublish}
          >
            {t.btn_publish} ora
          </Button>
        </div>
      </div>
    </Modal>
  )
}
