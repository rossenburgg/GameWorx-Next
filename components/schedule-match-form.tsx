// components/schedule-match-form.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'
import { showToast } from "@/lib/utils"

export function ScheduleMatchForm() {
  const [teams, setTeams] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [game, setGame] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [tournamentId, setTournamentId] = useState('no_tournament')
  const [round, setRound] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchTeamsAndTournaments() {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, game')

      if (teamsError) {
        console.error('Error fetching teams:', teamsError)
        showToast('Error', 'Failed to fetch teams', "destructive")
      } else {
        setTeams(teamsData)
      }

      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, name')
        .order('start_date', { ascending: false })

      if (tournamentsError) {
        console.error('Error fetching tournaments:', tournamentsError)
        showToast('Error', 'Failed to fetch tournaments', "destructive")
      } else {
        setTournaments(tournamentsData)
      }
    }

    fetchTeamsAndTournaments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (team1 === team2) {
      showToast('Error', 'Teams must be different', "destructive")
      setLoading(false)
      return
    }

    const scheduledDateTime = new Date(`${date}T${time}`)

    const { error } = await supabase
      .from('matches')
      .insert({
        team1_id: team1,
        team2_id: team2,
        game,
        date: date, // Add this line
        time: time, // Add this line
        scheduled_time: scheduledDateTime.toISOString(),
        tournament_id: tournamentId !== 'no_tournament' ? tournamentId : null,
        round: round ? parseInt(round) : null
      })

    if (error) {
      console.error('Error scheduling match:', error)
      showToast('Error scheduling match', error.message, "destructive")
    } else {
      showToast('Match scheduled successfully', 'The match has been scheduled.')
      router.push('/matches')
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Match</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team1">Team 1</Label>
            <Select value={team1} onValueChange={(value) => {
              setTeam1(value)
              const selectedTeam = teams.find(t => t.id === value)
              if (selectedTeam) setGame(selectedTeam.game)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Team 1" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="team2">Team 2</Label>
            <Select value={team2} onValueChange={setTeam2}>
              <SelectTrigger>
                <SelectValue placeholder="Select Team 2" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="game">Game</Label>
            <Input
              id="game"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Match Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="time">Match Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tournament">Tournament (Optional)</Label>
            <Select value={tournamentId} onValueChange={setTournamentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_tournament">No Tournament</SelectItem>
                {tournaments.map(tournament => (
                  <SelectItem key={tournament.id} value={tournament.id}>{tournament.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="round">Round (Optional)</Label>
            <Input
              id="round"
              type="number"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder="e.g., 1 for first round"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Match'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}