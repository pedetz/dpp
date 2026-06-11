import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { useUploadCertification } from "@/hooks/useCertifications";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n";

export function CertificationUpload({ productId }: { productId: string }) {
  const upload = useUploadCertification();
  const toast = useToast();
  const [kind, setKind] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submit = () => {
    if (!file || !kind) return;
    upload.mutate(
      { productId, kind, validUntil: validUntil || null, file },
      {
        onSuccess: () => {
          toast.success(t("certifications.uploadedToast"));
          setKind("");
          setValidUntil("");
          setFile(null);
        },
        onError: () => toast.error(t("common.error")),
      },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Input
        label={t("certifications.kind")}
        value={kind}
        onChange={(e) => setKind(e.target.value)}
      />
      <Input
        type="date"
        label={t("certifications.validUntil")}
        value={validUntil}
        onChange={(e) => setValidUntil(e.target.value)}
      />
      <FileUpload
        accept="application/pdf"
        label={file ? file.name : t("certifications.file")}
        onSelect={setFile}
      />
      <Button
        disabled={!file || !kind}
        loading={upload.isPending}
        onClick={submit}
      >
        {t("certifications.upload")}
      </Button>
    </div>
  );
}
