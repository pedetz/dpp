import { supabase } from './supabase'

export interface PublicPassport {
  slug: string
  gtin: string | null
  name: string
  category: string
  images: string[]
  data: Record<string, unknown>
  version: number
  published_at: string
  brand_name: string
  logo_url: string | null
}

export interface VersionEntry {
  version: number
  published_at: string
  slug: string
}

export async function getPassportByGtin(gtin: string): Promise<PublicPassport | null> {
  const { data, error } = await supabase
    .from('public_passports')
    .select('*')
    .eq('gtin', gtin)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data as PublicPassport
}

export async function getPassportBySlug(slug: string): Promise<PublicPassport | null> {
  const { data, error } = await supabase
    .from('public_passports')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return data as PublicPassport
}

export async function getVersionHistory(productSlug: string): Promise<VersionEntry[]> {
  const baseSlug = productSlug.replace(/-v\d+$/, '')

  const { data, error } = await supabase
    .from('public_passports')
    .select('version, published_at, slug')
    .or(`slug.eq.${productSlug},slug.like.${baseSlug}-v%`)
    .order('version', { ascending: false })

  if (error || !data) return []
  return data as VersionEntry[]
}
