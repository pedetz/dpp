import { useState } from 'react'
import { Download, Trash2, FileText } from 'lucide-react'
import type { Certification } from '@passaporto/shared'
import { useCertifications } from '@/hooks/useCertifications'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

interface CertificationListProps {
  productId: string
}

export function CertificationList({ productId }: CertificationListProps) {
  const { data: certs, isLoading, remove, getSignedUrl } = useCertifications(productId)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (cert: Certification) => {
    setDownloading(cert.id)
    try {
      const url = await getSignedUrl(cert.file_path)
      window.open(url, '_blank')
    } finally {
      setDownloading(null)
    }
  }

  if (isLoading) return <Spinner />

  if (!certs?.length) {
    return (
      <p className="text-sm text-gray-500 italic">Nessuna certificazione caricata.</p>
    )
  }

  return (
    <div className="space-y-2">
      {certs.map((cert) => (
        <div
          key={cert.id}
          className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3"
        >
          <FileText className="h-5 w-5 text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{cert.kind}</p>
            {cert.valid_until && (
              <p className="text-xs text-gray-500">Valido fino al {formatDate(cert.valid_until)}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            loading={downloading === cert.id}
            onClick={() => handleDownload(cert)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => remove.mutate(cert)}
            loading={remove.isPending}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
