import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product, ProductStatus, ProductData } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'
import { useOrg } from './useOrg'
import { slugify } from '@/lib/utils'

interface ProductFilters {
  status?: ProductStatus
  search?: string
}

interface CreateProductInput {
  name: string
  sku?: string
  gtin?: string
  category: string
  data?: ProductData
  images?: string[]
}

interface UpdateProductInput {
  id: string
  name?: string
  sku?: string
  gtin?: string
  category?: string
  data?: ProductData
  images?: string[]
}

export function useProducts(filters?: ProductFilters) {
  const { org } = useOrg()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['products', org?.id, filters],
    enabled: !!org?.id,
    queryFn: async () => {
      let q = supabase
        .from('products')
        .select('*')
        .eq('org_id', org!.id)
        .order('updated_at', { ascending: false })

      if (filters?.status) q = q.eq('status', filters.status)
      if (filters?.search) q = q.ilike('name', `%${filters.search}%`)

      const { data, error } = await q
      if (error) throw error
      return data as Product[]
    },
  })

  const create = useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const slug = slugify(input.name)
      const { data, error } = await supabase
        .from('products')
        .insert({
          org_id: org!.id,
          name: input.name,
          sku: input.sku ?? null,
          gtin: input.gtin ?? null,
          category: input.category,
          slug,
          status: 'draft' as ProductStatus,
          data: input.data ?? {},
          images: input.images ?? [],
        })
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products', org?.id] }),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: UpdateProductInput) => {
      const { data, error } = await supabase
        .from('products')
        .update(input)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['products', org?.id] })
      qc.invalidateQueries({ queryKey: ['product', product.id] })
    },
  })

  const publish = useMutation({
    mutationFn: async (id: string) => {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError

      const nextVersion = (product.current_version ?? 0) + 1

      const { error: versionError } = await supabase.from('passport_versions').insert({
        product_id: id,
        version: nextVersion,
        data: product.data,
        published_by: (await supabase.auth.getUser()).data.user!.id,
        published_at: new Date().toISOString(),
      })
      if (versionError) throw versionError

      const { data, error } = await supabase
        .from('products')
        .update({ status: 'published' as ProductStatus, current_version: nextVersion })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['products', org?.id] })
      qc.invalidateQueries({ queryKey: ['product', product.id] })
      qc.invalidateQueries({ queryKey: ['versions', product.id] })
    },
  })

  const archive = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .update({ status: 'archived' as ProductStatus })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Product
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['products', org?.id] })
      qc.invalidateQueries({ queryKey: ['product', product.id] })
    },
  })

  return { ...query, create, update, publish, archive }
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Product
    },
  })
}
