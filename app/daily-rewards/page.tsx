// app/daily-rewards/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DailyRewardItem } from '@/components/DailyRewardItem'
import { FreeCaseDrop } from '@/components/FreeCaseDrop'
import { PrivateDiscordAccount } from '@/components/PrivateDiscordAccount'
import { Cashback } from '@/components/Cashback'
import { useToast } from "@/hooks/use-toast"
import { StreamChatComponent } from '@/components/StreamChatComponent'
import { MessageCircleIcon, X } from 'lucide-react'  // Added X here
import { Skeleton } from '@/components/ui/skeleton'


interface User {
  id: string
  email: string
  user_metadata: {
    avatar_url?: string
    username?: string
    name?: string    // Added name if you're using it
  }
  // If username is directly on the user object, add it here
  username?: string  
}

export default function DailyRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchUserAndRewards()
    fetchInitialMessages()
    subscribeToMessages()
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  async function fetchUserAndRewards() {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('day')

      if (error) {
        console.error('Error fetching rewards:', error)
      } else {
        setRewards(data || [])
      }
    }
    setIsLoading(false)
  }

  async function fetchInitialMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setMessages(data.reverse())
    }
    setIsLoadingMessages(false)
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prevMessages => [...prevMessages, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleClaim(day: number) {
    const { data, error } = await supabase
      .from('daily_rewards')
      .update({ claimed: true })
      .eq('user_id', user.id)
      .eq('day', day)
      .select()

    if (error) {
      console.error('Error claiming reward:', error)
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      })
    } else {
      setRewards(rewards.map(reward => 
        reward.day === day ? { ...reward, claimed: true } : reward
      ))
      toast({
        title: "Success",
        description: `Claimed reward for day ${day}!`,
        variant: "default",
      })
      
      // Add bot message
      await supabase
        .from('messages')
        .insert({
          user_id: 'bot',
          content: `${user.user_metadata.name || user.email} claimed their day ${day} reward!`
        })
    }
  }

  useEffect(() => {
    async function fetchCurrentUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error fetching user:', error)
        return
      }

      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email!,
          user_metadata: user.user_metadata
        })
      }
    }

    fetchCurrentUser()
  }, [])

  
  if (!currentUser) {
    return <DailyRewardsSkeleton />
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-900 text-white"> 
      <div className="flex-grow p-4 overflow-y-auto">

        {isMobile && <FreeCaseDrop />}
        {isLoading ? (
          <div>Loading...</div>
        ) : rewards.length === 0 ? (
          <div>No rewards available at the moment.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rewards.map((reward) => (
              <DailyRewardItem
                key={reward.day}
                day={reward.day}
                claimed={reward.claimed}
                unlockTime={reward.unlock_time ? new Date(reward.unlock_time).toLocaleTimeString() : undefined}
                onClaim={() => handleClaim(reward.day)}
                rewardType={reward.reward_type}
                rewardAmount={reward.reward_amount}
              />
            ))}
          </div>
        )}
        <PrivateDiscordAccount />
        <Cashback />
      </div>
      {!isMobile && (
        <div className="w-1/4 min-w-[300px] bg-gray-800 flex flex-col">
          <div className="p-4">
            <FreeCaseDrop />
          </div>
          <div className="flex-grow overflow-hidden">
          <StreamChatComponent 
          user={{
            id: currentUser.id,
            name: currentUser.user_metadata?.username || currentUser.email,
            image: currentUser.user_metadata?.avatar_url
          }}
        />
          </div>
        </div>
      )}
     {isMobile && (
  <>
    <button
      onClick={() => setIsChatOpen(!isChatOpen)}
      className="fixed bottom-4 right-4 bg-purple-600 p-3 rounded-full shadow-lg z-10"
    >
      <MessageCircleIcon className="text-white text-2xl" />
    </button>
    {isChatOpen && (
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gray-800 z-20 p-4 shadow-lg">
        <button
          onClick={() => setIsChatOpen(false)}
          className="absolute top-2 right-2 text-white p-2"
        >
          <X size={24} />
        </button>
        <StreamChatComponent 
          user={{
            id: currentUser.id,
            name: currentUser.user_metadata?.username || currentUser.email,
            image: currentUser.user_metadata?.avatar_url
          }}
        />
      </div>
    )}
  </>
)}
    </div>
  )
}

function DailyRewardsSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}