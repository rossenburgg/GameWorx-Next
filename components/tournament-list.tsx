// components/tournament-list.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export function TournamentList() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTournaments() {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching tournaments:', error)
      } else {
        setTournaments(data)
      }
      setLoading(false)
    }

    fetchTournaments()
  }, [])

  if (loading) {
    return <div>Loading tournaments...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map((tournament) => (
        <Card key={tournament.id}>
          <CardHeader>
            <CardTitle>{tournament.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Game:</strong> {tournament.game}</p>
            <p><strong>Dates:</strong> {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {tournament.status}</p>
            <p><strong>Prize Pool:</strong> ${tournament.prize_pool}</p>
            <Link href={`/tournaments/${tournament.id}`}>
              <Button className="mt-4">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}