"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LoginModal } from './login-modal'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { NotificationIcon } from './NotificationIcon'

export function UserNav() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      // Fetch initial balance
      fetchBalance()

      // Set up real-time subscription
      const walletSubscription = supabase
        .channel('wallet_changes')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'wallets', 
            filter: `user_id=eq.${user.id}` 
          },
          (payload) => {
            setBalance(payload.new.balance)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(walletSubscription)
      }
    }
  }, [user])

  const fetchBalance = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching balance:', error)
      } else if (data) {
        setBalance(data.balance)
      }
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      showToast("Sign out failed", error.message, "destructive")
    } else {
      showToast("Signed out successfully", "Come back soon!")
      router.push('/')
    }
  }

  if (!user) {
    return <LoginModal />
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="hidden md:inline text-sm font-medium">
        {balance.toFixed(2)} Xcoin
      </span>
      <NotificationIcon />
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata.avatar_url || ''} alt={user.email} />
              <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.user_metadata.username || user.email}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground md:hidden">
                {balance.toFixed(2)} Xcoin
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}