import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductsPage } from './pages/ProductsPage'
import { WarehousesPage } from './pages/WarehousesPage'
import { MovementsPage } from './pages/MovementsPage'
import { ReportsPage } from './pages/ReportsPage'

function ProtectedApp() {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout />
}

export default function App() {
  const { user } = useApp()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedApp />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/warehouses" element={<WarehousesPage />} />
        <Route path="/movements" element={<MovementsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
