// components/match-list.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export function MatchList() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id (name),
          team2:teams!team2_id (name)
        `)
        .order('scheduled_time', { ascending: true })

      if (error) {
        console.error('Error fetching matches:', error)
      } else {
        setMatches(data)
      }
      setLoading(false)
    }

    fetchMatches()
  }, [])

  if (loading) {
    return <div>Loading matches...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {matches.map((match) => (
      <Card key={match.id}>
        <CardHeader>
          <CardTitle>{match.team1.name} vs {match.team2.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Game: {match.game}</p>
          <p>Date: {new Date(match.date).toLocaleDateString()}</p>
          <p>Time: {match.time}</p>
          <p>Status: {match.status}</p>
          {match.result && <p>Result: {match.result}</p>}
          <Link href={`/matches/${match.id}`}>
            <Button className="mt-4">View Details</Button>
          </Link>
        </CardContent>
      </Card>
    ))}
  </div>

  )
}