import { serve } from 'jsr:@std/http/server'
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface StripeEvent {
  id: string
  type: string
  data: {
    object: StripeSubscription | StripeCheckoutSession
  }
}

interface StripeSubscription {
  id: string
  customer: string
  status: string
  current_period_end: number
  metadata: Record<string, string>
  items: {
    data: Array<{
      price: {
        metadata: Record<string, string>
      }
    }>
  }
}

interface StripeCheckoutSession {
  id: string
  customer: string
  subscription: string
  metadata: Record<string, string>
  mode: string
}

function planFromMetadata(metadata: Record<string, string>): string {
  const plan = metadata['plan']
  if (plan && ['trial', 'starter', 'pro', 'filiera'].includes(plan)) {
    return plan
  }
  return 'starter'
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  let event: StripeEvent
  try {
    const body = await req.text()
    event = JSON.parse(body) as StripeEvent
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession
        if (session.mode !== 'subscription') break

        const orgId = session.metadata['org_id']
        if (!orgId) break

        const plan = planFromMetadata(session.metadata)

        await supabase.from('subscriptions').upsert({
          org_id: orgId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan,
          status: 'active',
          current_period_end: null,
        })

        await supabase
          .from('organizations')
          .update({ plan })
          .eq('id', orgId)

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as StripeSubscription
        const orgId = sub.metadata['org_id']
        if (!orgId) break

        const plan = planFromMetadata(
          sub.items.data[0]?.price.metadata ?? sub.metadata
        )

        const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

        await supabase.from('subscriptions').upsert({
          org_id: orgId,
          stripe_customer_id: sub.customer,
          stripe_subscription_id: sub.id,
          plan,
          status: sub.status,
          current_period_end: periodEnd,
        })

        if (sub.status === 'active') {
          await supabase
            .from('organizations')
            .update({ plan })
            .eq('id', orgId)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as StripeSubscription
        const orgId = sub.metadata['org_id']
        if (!orgId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', plan: 'trial' })
          .eq('org_id', orgId)

        await supabase
          .from('organizations')
          .update({ plan: 'trial' })
          .eq('id', orgId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as { subscription: string; customer: string }
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription)

        break
      }

      default:
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
