import { useState } from "react";
import type { Role } from "@passaporto/shared";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

const functionsUrl = import.meta.env.VITE_EDGE_FUNCTIONS_URL;

interface InviteMemberProps {
  orgId: string | null;
  open: boolean;
  onClose: () => void;
}

export function InviteMember({ orgId, open, onClose }: InviteMemberProps) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const response = await fetch(`${functionsUrl}/invite-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orgId, email, role }),
      });
      if (!response.ok) throw new Error("failed");
      toast.success(t("members.invitedToast"));
      setEmail("");
      onClose();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("members.inviteTitle")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!email} loading={busy} onClick={() => void submit()}>
            {t("members.sendInvite")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          type="email"
          label={t("members.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Select
          label={t("members.role")}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          options={[
            { value: "editor", label: t("members.roleEditor") },
            { value: "viewer", label: t("members.roleViewer") },
            { value: "owner", label: t("members.roleOwner") },
          ]}
        />
      </div>
    </Modal>
  );
}
