// app/daily-rewards/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DailyRewardItem } from '@/components/DailyRewardItem'
import { ChatSection } from '@/components/ChatSection'
import { FreeCaseDrop } from '@/components/FreeCaseDrop'
import { PrivateDiscordAccount } from '@/components/PrivateDiscordAccount'
import { Cashback } from '@/components/Cashback'
import { useToast } from "@/hooks/use-toast"

export default function DailyRewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserAndRewards()
    fetchInitialMessages()
    subscribeToMessages()
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

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-grow p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">DAILY REWARDS</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : rewards.length === 0 ? (
          <div>No rewards available at the moment.</div>
        ) : (
          <div className="flex space-x-4 overflow-x-auto pb-4">
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
      <div className="w-1/4 min-w-[300px] bg-gray-800 p-4">
        <FreeCaseDrop />
        <div className="mt-4 h-[calc(100vh-200px)]">
        <ChatSection currentUser={user} />
        </div>
      </div>
    </div>
  )
}