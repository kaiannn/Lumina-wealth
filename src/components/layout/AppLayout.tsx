import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
