import { useNavigate } from 'react-router-dom'
import { BrandWizard } from '@/components/onboarding/BrandWizard'

export default function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <BrandWizard onComplete={() => navigate('/products/new')} />
      </div>
    </div>
  )
}
