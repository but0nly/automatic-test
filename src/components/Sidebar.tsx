'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Globe, Terminal, CalendarRange, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '项目管理', href: '/projects', icon: FolderKanban },
  { name: '环境变量', href: '/environments', icon: Globe },
  { name: '接口自动化', href: '/api-test', icon: Terminal },
  { name: 'UI自动化', href: '/ui-test', icon: Globe },
  { name: '测试计划', href: '/test-plans', icon: CalendarRange },
  { name: '测试报告', href: '/test-reports', icon: BarChart3 },
  { name: '系统设置', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-gray-50/40">
      <div className="flex h-14 items-center border-b px-6 font-semibold">
        <Link href="/" className="flex items-center gap-2">
          <Terminal className="h-6 w-6" />
          <span>AutoTest Platform</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900',
                    isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
                  )}
                >
                  <item.icon className={cn('mr-3 h-4 w-4', isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900')} />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
