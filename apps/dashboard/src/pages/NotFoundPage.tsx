import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { t } from "@/i18n";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <SearchX className="h-16 w-16 text-gray-300" />
      <h1 className="text-3xl font-bold text-gray-900">{t("notFound.title")}</h1>
      <p className="max-w-sm text-gray-500">{t("notFound.description")}</p>
      <Button onClick={() => navigate("/")}>
        {t("notFound.goHome")}
      </Button>
    </div>
  );
}
