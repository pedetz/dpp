import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Certification } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'

interface UploadCertificationInput {
  productId: string
  kind: string
  file: File
  validUntil?: string
}

export function useCertifications(productId: string) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['certifications', productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('product_id', productId)
        .order('id')
      if (error) throw error
      return data as Certification[]
    },
  })

  const upload = useMutation({
    mutationFn: async (input: UploadCertificationInput) => {
      const ext = input.file.name.split('.').pop()
      const path = `${input.productId}/${Date.now()}.${ext}`

      const { error: storageError } = await supabase.storage
        .from('certifications')
        .upload(path, input.file)
      if (storageError) throw storageError

      const { data, error } = await supabase
        .from('certifications')
        .insert({
          product_id: input.productId,
          kind: input.kind,
          file_path: path,
          valid_until: input.validUntil ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data as Certification
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certifications', productId] }),
  })

  const remove = useMutation({
    mutationFn: async (cert: Certification) => {
      const { error: storageError } = await supabase.storage
        .from('certifications')
        .remove([cert.file_path])
      if (storageError) throw storageError

      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', cert.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['certifications', productId] }),
  })

  const getSignedUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('certifications')
      .createSignedUrl(filePath, 3600)
    if (error) throw error
    return data.signedUrl
  }

  return { ...query, upload, remove, getSignedUrl }
}
