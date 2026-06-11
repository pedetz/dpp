import { useQuery } from '@tanstack/react-query'
import type { TemplateField } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'
import { getTemplate } from '@/lib/templates'

export function useTemplates(category: string) {
  return useQuery({
    queryKey: ['template', category],
    enabled: !!category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_templates')
        .select('fields')
        .eq('category', category)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (data) return data.fields as TemplateField[]
      return getTemplate(category)
    },
  })
}
