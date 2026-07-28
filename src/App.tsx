import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MobileFilterProvider } from '@/contexts/MobileFilterContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
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
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  {/* Touch-only routes; desktop opens the dialog instead. */}
                  <Route path="transactions/new" element={<TransactionFormPage />} />
                  <Route path="transactions/:id/edit" element={<TransactionFormPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
      </MobileFilterProvider>
    </ThemeProvider>
  )
}
