// components/leagues-list.tsx
"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Trophy, Users, UserSquare2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type League = {
  id: number;
  name: string;
  logo_url: string;
  prize_pool: number;
  team_size: string | number;
  participants: string;
  organizer: { name: string; avatar: string };
  status: string;
  end_date: string;
  game: string;
  platform: string;
  type: string;
}

function LeagueSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-12 h-12 bg-gray-700 rounded-md mr-3"></div>
          <div>
            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-32"></div>
          </div>
        </div>
        <div className="flex space-x-2 mb-4">
          <div className="h-6 bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-700 rounded w-16"></div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-600 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-600 rounded w-24"></div>
        </div>
        <div className="h-8 bg-gray-600 rounded w-24"></div>
      </div>
    </div>
  )
}

export function LeaguesList() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeagues() {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
      
      if (error) {
        console.error('Error fetching leagues:', error)
      } else {
        setLeagues(data || [])
      }
      setLoading(false)
    }

    fetchLeagues()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <LeagueSkeleton key={index} />
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {leagues.map((league) => (
        <div key={league.id} className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-2 sm:p-4">
            <div className="flex items-center mb-2">
              <Image
                src={league.logo_url}
                alt={league.name}
                width={40}
                height={40}
                className="rounded-md mr-2 sm:mr-3"
              />
              <div>
                <p className="text-xs text-gray-400 hidden sm:block">Ending at {league.end_date}</p>
                <h3 className="text-sm sm:text-lg font-bold">{league.name}</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2 sm:mb-4">
              <span className="bg-gray-700 text-xs px-1 py-0.5 rounded">{league.game}</span>
              <span className="bg-gray-700 text-xs px-1 py-0.5 rounded">{league.platform}</span>
              <span className="bg-gray-700 text-xs px-1 py-0.5 rounded">{league.type}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm mb-2 sm:mb-4">
              <div>
                <p className="text-gray-400 flex items-center"><Trophy size={12} className="mr-1" /> Prize</p>
                <p className="font-bold">${league.prize_pool.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center"><Users size={12} className="mr-1" /> Team</p>
                <p className="font-bold">{league.team_size}</p>
              </div>
              <div>
                <p className="text-gray-400 flex items-center"><UserSquare2 size={12} className="mr-1" /> Players</p>
                <p className="font-bold">{league.participants}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-700 p-2 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <Image
                src={league.organizer.avatar}
                alt={league.organizer.name}
                width={20}
                height={20}
                className="rounded-full mr-1 sm:mr-2"
              />
              <span className="text-xs sm:text-sm">
                By <span className="font-bold">{league.organizer.name}</span>
              </span>
            </div>
            <Button 
              variant={league.status === "Registration" ? "blue" : "green"}
              className="text-xs px-2 py-1 sm:px-4 sm:py-2 w-full sm:w-auto"
            >
              {league.status}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}