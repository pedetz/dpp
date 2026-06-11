import { BrandWizard } from "@/components/onboarding/BrandWizard";
import { t } from "@/i18n";

export function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {t("onboarding.title")}
        </h1>
        <BrandWizard />
      </div>
    </div>
  );
}
