import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsTabs } from "@/components/layout/SettingsTabs";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { useOrg, useUpdateOrg } from "@/hooks/useOrg";
import { uploadPublicImage } from "@/lib/storage";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

export function SettingsPage() {
  const toast = useToast();
  const { org, orgId } = useOrg();
  const update = useUpdateOrg(orgId);
  const [name, setName] = useState("");
  const [vat, setVat] = useState("");
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (!org) return;
    setName(org.name);
    setVat(org.vat_number ?? "");
    setLogo(org.logo_url);
  }, [org]);

  const handleLogo = async (file: File) => {
    if (!orgId) return;
    try {
      const url = await uploadPublicImage(`logos/${orgId}`, file);
      setLogo(url);
    } catch {
      toast.error(t("common.error"));
    }
  };

  const save = () => {
    update.mutate(
      { name, vat_number: vat || null, logo_url: logo },
      {
        onSuccess: () => toast.success(t("settings.savedToast")),
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <div>
      <PageHeader title={t("settings.title")} />
      <SettingsTabs />
      <Card className="max-w-xl">
        <CardBody className="flex flex-col gap-4">
          <Input label={t("settings.brandName")} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t("settings.vatNumber")} value={vat} onChange={(e) => setVat(e.target.value)} />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">{t("settings.logo")}</span>
            {logo ? <img src={logo} alt="" className="h-20 w-20 rounded-lg object-cover" /> : null}
            <FileUpload accept="image/*" label={t("common.upload")} onSelect={(file) => void handleLogo(file)} />
          </div>
        </CardBody>
        <CardFooter className="flex justify-end">
          <Button loading={update.isPending} onClick={save}>
            {t("common.save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
