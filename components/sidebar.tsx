// components/sidebar.tsx
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, Trophy, Users, BarChart2, LayoutDashboard, Gamepad2Icon, Wallet2Icon, VideoIcon, PiggyBankIcon, TicketIcon  } from 'lucide-react'
import { BuildingStorefrontIcon } from '@heroicons/react/24/solid'

const sidebarItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet', href: '/wallet', icon: Wallet2Icon },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Matches', href: '/matches', icon: Gamepad2Icon },
    { name: 'Leaderboard', href: '/leaderboard', icon: BarChart2 },
    { name: 'Stream', href: '/stream', icon: VideoIcon },
    { name: 'Daily Rewards', href: '/daily-rewards', icon: PiggyBankIcon },

    { name: 'Store', href: '/store', icon: BuildingStorefrontIcon },
    { name: 'P2P-Games', href:'/p2p-games', icon: TicketIcon}


  ]
export function Sidebar() {
  const pathname = usePathname()

  return (
    <ScrollArea className="h-full py-6">
      <div className="space-y-4 py-4">
        {sidebarItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname === item.href && "bg-muted hover:bg-muted"
            )}
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              <span className="sr-only">{item.name}</span>
            </Link>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}