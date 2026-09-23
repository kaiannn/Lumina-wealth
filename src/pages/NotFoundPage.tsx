import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
      <p className="text-gray-400 mb-6">页面不存在</p>
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors"
      >
        <Home className="w-4 h-4" />
        返回首页
      </Link>
    </div>
  )
}
