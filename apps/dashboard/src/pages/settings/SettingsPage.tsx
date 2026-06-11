import { useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { useOrg } from '@/hooks/useOrg'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import t from '@/i18n/it.json'

export default function SettingsPage() {
  const { org } = useOrg()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [vat, setVat] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!org) return
    setName(org.name)
    setVat(org.vat_number ?? '')
    setLogoUrl(org.logo_url ?? '')
  }, [org])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !org) return
    setUploadingLogo(true)
    try {
      const path = `${org.id}/logo.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(data.publicUrl)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name, vat_number: vat, logo_url: logoUrl || null })
        .eq('id', org.id)
      if (error) throw error
      qc.invalidateQueries({ queryKey: ['org', org.id] })
      toast('Impostazioni salvate', 'success')
    } catch {
      toast('Errore durante il salvataggio', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title={t.nav_settings} subtitle="Gestisci i dati del tuo brand." />

      <Card className="max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t.onboarding_brand_name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t.onboarding_vat}
            value={vat}
            onChange={(e) => setVat(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t.onboarding_logo}</label>
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-md object-contain border border-gray-200" />
            )}
            <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-gray-300 px-3 py-2 hover:border-green-400 transition-colors">
              <Upload className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploadingLogo ? 'Caricamento...' : 'Carica logo'}
              </span>
              <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
            </label>
          </div>

          <Button type="submit" loading={loading}>{t.btn_save}</Button>
        </form>
      </Card>
    </div>
  )
}
