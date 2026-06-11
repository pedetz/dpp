import { useState } from 'react'
import { CheckCircle, Upload } from 'lucide-react'
import { useOrg } from '@/hooks/useOrg'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import t from '@/i18n/it.json'
import type { Organization } from '@passaporto/shared'

interface BrandWizardProps {
  onComplete: () => void
}

type Step = 1 | 2 | 3

export function BrandWizard({ onComplete }: BrandWizardProps) {
  const { createOrg } = useOrg()
  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [vat, setVat] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Campo obbligatorio'
    if (!vat.trim()) errs.vat = 'Campo obbligatorio'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const newOrg = await createOrg({ name, vat_number: vat })
      setOrg(newOrg)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !org) return
    setUploadingLogo(true)
    try {
      const path = `${org.id}/logo.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      await supabase.from('organizations').update({ logo_url: data.publicUrl }).eq('id', org.id)
      setLogoUrl(data.publicUrl)
    } finally {
      setUploadingLogo(false)
    }
  }

  if (step === 1) {
    return (
      <form onSubmit={handleStep1} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Benvenuto in Passaporto</h2>
          <p className="mt-1 text-sm text-gray-600">Configura il tuo brand per iniziare.</p>
        </div>
        <Input
          label={t.onboarding_brand_name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <Input
          label={t.onboarding_vat}
          value={vat}
          onChange={(e) => setVat(e.target.value)}
          error={errors.vat}
          placeholder="IT12345678901"
          required
        />
        <Button type="submit" loading={loading} className="w-full">Continua</Button>
      </form>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.onboarding_logo}</h2>
          <p className="mt-1 text-sm text-gray-600">Carica il logo della tua azienda (opzionale).</p>
        </div>
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-md object-contain border border-gray-200" />
        )}
        <label className="flex items-center gap-3 cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-3 hover:border-green-400 transition-colors">
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {uploadingLogo ? 'Caricamento...' : 'Carica logo (PNG, SVG, JPG)'}
          </span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
        </label>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setStep(3)}>Salta</Button>
          <Button onClick={() => setStep(3)}>Continua</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-center">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <div>
        <h2 className="text-xl font-bold text-gray-900">Configurazione completata!</h2>
        <p className="mt-1 text-sm text-gray-600">Crea il tuo primo prodotto digitale.</p>
      </div>
      <Button onClick={onComplete} className="w-full">Crea il primo prodotto</Button>
    </div>
  )
}
