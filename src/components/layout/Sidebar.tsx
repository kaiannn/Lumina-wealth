import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowRightLeft,
  BarChart3,
  Users,
  Settings,
  Flame,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '总览' },
  { to: '/transactions', icon: ArrowRightLeft, label: '交易记录' },
  { to: '/analysis', icon: BarChart3, label: '持仓分析' },
  { to: '/compare', icon: Users, label: '大牛对比' },
  { to: '/settings', icon: Settings, label: '设置' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800 flex flex-col z-50">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <Flame className="w-7 h-7 text-amber-400" />
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Lumina Wealth</h1>
          <p className="text-[10px] text-gray-500 tracking-widest">萤火财富</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600">v0.1.0 · Local-First</p>
      </div>
    </aside>
  )
}
