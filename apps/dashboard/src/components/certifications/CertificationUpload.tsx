import { useState } from 'react'
import { useCertifications } from '@/hooks/useCertifications'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const CERT_KINDS = [
  { value: 'GOTS', label: 'GOTS' },
  { value: 'OEKO-TEX', label: 'OEKO-TEX' },
  { value: 'FSC', label: 'FSC' },
  { value: 'altro', label: 'Altro' },
]

interface CertificationUploadProps {
  productId: string
  onSuccess?: () => void
}

export function CertificationUpload({ productId, onSuccess }: CertificationUploadProps) {
  const { upload } = useCertifications(productId)
  const [kind, setKind] = useState('GOTS')
  const [validUntil, setValidUntil] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Seleziona un file PDF'); return }
    setError('')
    await upload.mutateAsync({ productId, kind, file, validUntil: validUntil || undefined })
    setFile(null)
    setValidUntil('')
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Tipo certificazione"
        options={CERT_KINDS}
        value={kind}
        onChange={(e) => setKind(e.target.value)}
      />
      <Input
        label="Valido fino al"
        type="date"
        value={validUntil}
        onChange={(e) => setValidUntil(e.target.value)}
      />
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">File PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <Button type="submit" loading={upload.isPending}>
        Carica certificazione
      </Button>
    </form>
  )
}
