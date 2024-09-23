// components/matches-list.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { CardSkeleton } from "@/components/skeletons"
import { supabase } from '@/lib/supabase'

export function MatchesList() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchMatches() {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id(name),
          team2:teams!team2_id(name)
        `)
      
      if (error) {
        console.error('Error fetching matches:', error)
      } else {
        setMatches(data)
      }
      setLoading(false)
    }

    fetchMatches()
  }, [])

  const filteredMatches = matches.filter(match =>
    match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.team2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.game.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Input
        className="max-w-sm mb-4"
        placeholder="Search matches..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : filteredMatches.map((match) => (
              <Card key={match.id}>
                <CardHeader>
                  <CardTitle>{match.team1.name} vs {match.team2.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2"><strong>Game:</strong> {match.game}</p>
                  <p className="mb-2"><strong>Date:</strong> {match.date}</p>
                  <p className="mb-2"><strong>Time:</strong> {match.time}</p>
                  <p className="mb-4"><strong>Status:</strong> {match.status}</p>
                  {match.result && <p className="mb-4"><strong>Result:</strong> {match.result}</p>}
                  <Link href={`/matches/${match.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))
        }
      </div>
    </div>
  )
}