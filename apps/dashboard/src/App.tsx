import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrgs } from "@/hooks/useOrg";
import { Spinner } from "@/components/ui/Spinner";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { ProductsPage } from "@/pages/products/ProductsPage";
import { NewProductPage } from "@/pages/products/NewProductPage";
import { ProductDetailPage } from "@/pages/products/ProductDetailPage";
import { QRPage } from "@/pages/qr/QRPage";
import { LabelsPage } from "@/pages/qr/LabelsPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { MembersPage } from "@/pages/settings/MembersPage";
import { BillingPage } from "@/pages/settings/BillingPage";

function FullScreenSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { session, loading } = useAuth();
  const orgsQuery = useMyOrgs();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (orgsQuery.isLoading) return <FullScreenSpinner />;

  const hasOrg = (orgsQuery.data?.length ?? 0) > 0;
  if (!hasOrg && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function RootRedirect() {
  const { session, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  return <Navigate to={session ? "/products" : "/login"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
