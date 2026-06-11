import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import type { OrgMember, MemberRole } from '@passaporto/shared'
import { supabase } from '@/lib/supabase'
import { useOrg } from '@/hooks/useOrg'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import t from '@/i18n/it.json'

const ROLE_OPTIONS = [
  { value: 'editor', label: t.members_role_editor },
  { value: 'viewer', label: t.members_role_viewer },
]

const roleLabels: Record<MemberRole, string> = {
  owner: t.members_role_owner,
  editor: t.members_role_editor,
  viewer: t.members_role_viewer,
}

export default function MembersPage() {
  const { org, isOwner } = useOrg()
  const { session } = useAuth()
  const { toast } = useToast()
  const qc = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('editor')

  const { data: members } = useQuery({
    queryKey: ['members', org?.id],
    enabled: !!org?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_members')
        .select('*')
        .eq('org_id', org!.id)
      if (error) throw error
      return data as OrgMember[]
    },
  })

  const invite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: MemberRole }) => {
      const { error } = await supabase.functions.invoke('invite-member', {
        body: { org_id: org!.id, email, role },
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast('Invito inviato', 'success')
      setInviteEmail('')
      qc.invalidateQueries({ queryKey: ['members', org?.id] })
    },
    onError: () => toast('Errore durante l\'invito', 'error'),
  })

  const removeMember = useMutation({
    mutationFn: async (member: OrgMember) => {
      const { error } = await supabase
        .from('org_members')
        .delete()
        .eq('org_id', member.org_id)
        .eq('user_id', member.user_id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', org?.id] }),
  })

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    invite.mutate({ email: inviteEmail, role: inviteRole })
  }

  return (
    <div>
      <PageHeader title="Membri del team" />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Membri attuali</h3>
          <div className="space-y-3">
            {(members ?? []).map((m) => (
              <div key={m.user_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    U
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.user_id}</p>
                    <Badge variant={m.role === 'owner' ? 'draft' : 'draft'}>{roleLabels[m.role]}</Badge>
                  </div>
                </div>
                {isOwner && m.user_id !== session?.user.id && m.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember.mutate(m)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {isOwner && (
          <Card>
            <h3 className="text-base font-semibold text-gray-900 mb-4">{t.btn_invite}</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="email@azienda.it"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select
                  options={ROLE_OPTIONS}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="w-36"
                />
              </div>
              <Button type="submit" loading={invite.isPending}>
                {t.btn_invite}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
