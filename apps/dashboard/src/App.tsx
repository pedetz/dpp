import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toast'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'

import LoginPage from '@/pages/auth/LoginPage'
import OnboardingPage from '@/pages/onboarding/OnboardingPage'
import ProductsPage from '@/pages/products/ProductsPage'
import NewProductPage from '@/pages/products/NewProductPage'
import ProductDetailPage from '@/pages/products/ProductDetailPage'
import QRPage from '@/pages/qr/QRPage'
import LabelsPage from '@/pages/qr/LabelsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import MembersPage from '@/pages/settings/MembersPage'
import BillingPage from '@/pages/settings/BillingPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-green-600" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-green-600" />
      </div>
    )
  }

  return <Navigate to={session ? '/products' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<NewProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/qr" element={<QRPage />} />
            <Route path="/labels" element={<LabelsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/members" element={<MembersPage />} />
            <Route path="/settings/billing" element={<BillingPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
