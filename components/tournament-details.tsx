// components/tournament-details.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { showToast } from "@/lib/utils"
import { TournamentBracket } from './tournament-bracket'

export function TournamentDetails({ id }: { id: string }) {
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchTournamentAndMatches() {
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (tournamentError) {
        console.error('Error fetching tournament:', tournamentError)
        showToast('Error', 'Failed to fetch tournament details', "destructive")
        return
      }

      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id (name),
          team2:teams!team2_id (name)
        `)
        .eq('tournament_id', id)
        .order('round', { ascending: true })

      if (matchesError) {
        console.error('Error fetching matches:', matchesError)
        showToast('Error', 'Failed to fetch tournament matches', "destructive")
      } else {
        setTournament(tournamentData)
        setMatches(matchesData)
      }
      setLoading(false)
    }

    fetchTournamentAndMatches()
  }, [id])

  if (loading) {
    return <div>Loading tournament details...</div>
  }

  if (!tournament) {
    return <div>Tournament not found</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{tournament.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Game:</strong> {tournament.game}</p>
          <p><strong>Dates:</strong> {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {tournament.status}</p>
          <p><strong>Prize Pool:</strong> ${tournament.prize_pool}</p>
          <p className="mt-4">{tournament.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Bracket</CardTitle>
        </CardHeader>
        <CardContent>
          <TournamentBracket matches={matches} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {matches.map((match) => (
              <li key={match.id}>
                <Button variant="link" onClick={() => router.push(`/matches/${match.id}`)}>
                  Round {match.round}: {match.team1.name} vs {match.team2.name} - {new Date(match.scheduled_time).toLocaleString()}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button onClick={() => router.push('/tournaments')}>
        Back to Tournaments
      </Button>
    </div>
  )
}