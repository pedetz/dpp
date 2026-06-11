import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { t } from "@/i18n";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!emailPattern.test(email)) {
      setError(t("auth.invalidEmail"));
      return;
    }
    setError("");
    setBusy(true);
    try {
      await signIn(email);
      setSent(true);
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col gap-5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <MailCheck className="h-10 w-10 text-brand-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                {t("auth.checkEmailTitle")}
              </h1>
              <p className="text-sm text-gray-500">{t("auth.checkEmailBody", { email })}</p>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t("auth.loginTitle")}</h1>
                <p className="mt-1 text-sm text-gray-500">{t("auth.loginSubtitle")}</p>
              </div>
              <Input
                type="email"
                label={t("auth.emailLabel")}
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                error={error}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
              />
              <Button loading={busy} onClick={() => void submit()}>
                {busy ? t("auth.sending") : t("auth.sendMagicLink")}
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
