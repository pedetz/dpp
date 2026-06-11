import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { OrgMember, Role } from "@passaporto/shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsTabs } from "@/components/layout/SettingsTabs";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { InviteMember } from "@/components/onboarding/InviteMember";
import { useAuth } from "@/hooks/useAuth";
import { useOrg, useOrgMembers, useUpdateMemberRole, useRemoveMember } from "@/hooks/useOrg";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

const roleOptions = [
  { value: "owner", label: t("members.roleOwner") },
  { value: "editor", label: t("members.roleEditor") },
  { value: "viewer", label: t("members.roleViewer") },
];

export function MembersPage() {
  const toast = useToast();
  const { user } = useAuth();
  const { orgId } = useOrg();
  const { data, isLoading } = useOrgMembers(orgId);
  const updateRole = useUpdateMemberRole(orgId);
  const removeMember = useRemoveMember(orgId);
  const [inviteOpen, setInviteOpen] = useState(false);

  const changeRole = (member: OrgMember, role: Role) => {
    updateRole.mutate(
      { userId: member.user_id, role },
      { onError: () => toast.error(t("common.error")) },
    );
  };

  return (
    <div>
      <PageHeader
        title={t("members.title")}
        subtitle={t("members.subtitle")}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            {t("members.invite")}
          </Button>
        }
      />
      <SettingsTabs />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>{t("members.email")}</TH>
              <TH>{t("members.role")}</TH>
              <TH>{t("common.actions")}</TH>
            </TR>
          </THead>
          <TBody>
            {(data ?? []).map((member) => {
              const isSelf = member.user_id === user?.id;
              return (
                <TR key={member.user_id}>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Avatar name={member.user_id} />
                      <span className="font-mono text-xs">{member.user_id.slice(0, 8)}</span>
                      {isSelf ? <Badge variant="neutral">{t("members.you")}</Badge> : null}
                    </div>
                  </TD>
                  <TD>
                    <Select
                      value={member.role}
                      disabled={isSelf}
                      onChange={(e) => changeRole(member, e.target.value as Role)}
                      options={roleOptions}
                    />
                  </TD>
                  <TD>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSelf}
                      onClick={() => removeMember.mutate(member.user_id)}
                    >
                      {t("members.removeMember")}
                    </Button>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}

      <InviteMember orgId={orgId} open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
