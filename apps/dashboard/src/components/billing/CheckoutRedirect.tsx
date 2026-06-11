import { useState } from 'react'
import type { Plan } from '@passaporto/shared'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface CheckoutRedirectProps {
  plan: Plan
  label: string
}

export function CheckoutRedirect({ plan, label }: CheckoutRedirectProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan, returnUrl: window.location.href },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} loading={loading}>
      {label}
    </Button>
  )
}
