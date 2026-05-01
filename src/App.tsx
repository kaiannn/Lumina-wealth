import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import TransactionsPage from '@/pages/TransactionsPage'
import AnalysisPage from '@/pages/AnalysisPage'
import ComparePage from '@/pages/ComparePage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
