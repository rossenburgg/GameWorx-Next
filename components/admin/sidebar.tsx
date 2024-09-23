// components/admin/sidebar.tsx
import Link from 'next/link'
import { Home, Trophy, Flag } from 'lucide-react'

const sidebarItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Leagues', href: '/admin/leagues', icon: Trophy },
  { name: 'Tournaments', href: '/admin/tournaments', icon: Flag },
]

export function Sidebar() {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        {sidebarItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
          >
            <item.icon className="inline-block mr-2 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}