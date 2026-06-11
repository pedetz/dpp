import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import t from '@/i18n/it.json'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Inserisci un indirizzo email'); return }
    setLoading(true)
    setError('')
    try {
      await signIn(email)
      setSent(true)
    } catch {
      setError('Errore durante l\'invio. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Passaporto</h1>
          <p className="mt-1 text-gray-600 text-sm">{t.login_title}</p>
        </div>

        {sent ? (
          <div className="rounded-md bg-green-50 border border-green-200 p-4">
            <p className="text-sm font-medium text-green-800">{t.login_check_email}</p>
            <p className="mt-1 text-sm text-green-700">
              Abbiamo inviato un link di accesso a <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t.login_email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@azienda.it"
              error={error}
              autoFocus
            />
            <Button type="submit" loading={loading} className="w-full">
              {t.login_send_link}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
