import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MobileFilterProvider } from '@/contexts/MobileFilterContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ToastHost } from '@/components/ui/toast'
import { AppLayout } from '@/layout/AppLayout'
import { AuthPage } from '@/pages/auth'
import { DashboardPage } from '@/pages/dashboard'
import { TransactionsPage, TransactionFormPage } from '@/pages/transactions'
import { SettingsPage } from '@/pages/settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <MobileFilterProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<ProtectedRoute />}>
                {/*
                  Add/edit sits OUTSIDE AppLayout: it is a full-screen task, so
                  it carries neither the mobile header nor the bottom nav. It
                  brings its own back button and owns the whole viewport.
                  Touch-only — desktop opens the dialog and redirects here.
                */}
                <Route path="transactions/new" element={<TransactionFormPage />} />
                <Route path="transactions/:id/edit" element={<TransactionFormPage />} />

                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/*
              Global, not per-layout: the add/edit page lives outside AppLayout
              and still toasts on save.
            */}
            <ToastHost />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
      </MobileFilterProvider>
    </ThemeProvider>
  )
}
