import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organization, MemberRole } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface UseOrgReturn {
  org: Organization | null
  loading: boolean
  createOrg: (data: { name: string; vat_number: string }) => Promise<Organization>
  isOwner: boolean
  isEditor: boolean
}

export function useOrg(): UseOrgReturn {
  const { session } = useAuth()
  const qc = useQueryClient()

  const { data: member } = useQuery({
    queryKey: ['org-member', session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_members')
        .select('*')
        .eq('user_id', session!.user.id)
        .single()
      if (error) throw error
      return data
    },
  })

  const { data: org, isLoading } = useQuery({
    queryKey: ['org', member?.org_id],
    enabled: !!member?.org_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', member!.org_id)
        .single()
      if (error) throw error
      return data as Organization
    },
  })

  const { mutateAsync: createOrg } = useMutation({
    mutationFn: async (input: { name: string; vat_number: string }) => {
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: input.name, vat_number: input.vat_number, plan: 'trial' })
        .select()
        .single()
      if (orgError) throw orgError

      const { error: memberError } = await supabase.from('org_members').insert({
        org_id: newOrg.id,
        user_id: session!.user.id,
        role: 'owner' as MemberRole,
      })
      if (memberError) throw memberError

      return newOrg as Organization
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-member'] })
    },
  })

  const role = member?.role as MemberRole | undefined

  return {
    org: org ?? null,
    loading: isLoading,
    createOrg,
    isOwner: role === 'owner',
    isEditor: role === 'owner' || role === 'editor',
  }
}
