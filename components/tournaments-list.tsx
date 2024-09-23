// components/tournaments-list.tsx
"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

type Tournament = {
  id: number;
  name: string;
  date: string;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  status: string;
  image_url: string;
}

function TournamentSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-700"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}

export function TournamentsList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTournaments() {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
      
      if (error) {
        console.error('Error fetching tournaments:', error)
      } else {
        setTournaments(data || [])
      }
      setLoading(false)
    }

    fetchTournaments()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <TournamentSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tournaments.map((tournament) => (
        <div key={tournament.id} className="bg-gray-800 rounded-lg overflow-hidden">
          <Image
            src={tournament.image_url}
            alt={tournament.name}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-bold mb-2">{tournament.name}</h3>
            <p className="text-sm text-gray-400">Date: {tournament.date}</p>
            <p className="text-sm text-gray-400">Prize Pool: ${tournament.prize_pool.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mb-4">
              Participants: {tournament.current_participants}/{tournament.max_participants}
            </p>
            <Button 
              variant={tournament.status.toLowerCase() === "registration" ? "secondary" : "default"}
              className="w-full"
            >
              {tournament.status}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}