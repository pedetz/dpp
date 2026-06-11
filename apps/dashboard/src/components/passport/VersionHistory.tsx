import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { PassportVersion } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

interface VersionHistoryProps {
  productId: string
}

export function VersionHistory({ productId }: VersionHistoryProps) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const { data: versions, isLoading } = useQuery({
    queryKey: ['versions', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passport_versions')
        .select('*')
        .eq('product_id', productId)
        .order('version', { ascending: false })
      if (error) throw error
      return data as PassportVersion[]
    },
  })

  if (isLoading) return <Spinner />
  if (!versions?.length) return <p className="text-sm text-gray-500 italic">Nessuna versione pubblicata.</p>

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div key={v.version} className="rounded-md border border-gray-200 overflow-hidden">
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setExpanded(expanded === v.version ? null : v.version)}
          >
            <span className="text-sm font-medium text-gray-900">
              Versione {v.version}
            </span>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-xs">{formatDate(v.published_at)}</span>
              {expanded === v.version ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </button>
          {expanded === v.version && (
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <pre className="text-xs text-gray-600 overflow-auto max-h-48">
                {JSON.stringify(v.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
