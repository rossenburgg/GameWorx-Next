// components/create-team-form.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showToast } from "@/lib/utils"
import { supabase } from '@/lib/supabase'

export function CreateTeamForm() {
  const [teamName, setTeamName] = useState('')
  const [game, setGame] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({ name: teamName, game })
        .select()
        .single()
      if (teamError) throw teamError

      // Add the creator as the admin member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({ 
          team_id: teamData.id, 
          user_id: user.id, 
          name: user.user_metadata.username || user.email, 
          role: 'Admin' 
        })
      if (memberError) throw memberError

      showToast('Team created successfully', `Your team "${teamName}" has been created.`)
      router.push(`/teams/${teamData.id}`)
    } catch (error) {
      console.error('Error creating team:', error)
      showToast('Error creating team', error.message, "destructive")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a New Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select onValueChange={setGame} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rocket League">Rocket League</SelectItem>
                <SelectItem value="Fortnite">Fortnite</SelectItem>
                <SelectItem value="CS:GO">CS:GO</SelectItem>
                <SelectItem value="Dota 2">Dota 2</SelectItem>
                <SelectItem value="League of Legends">League of Legends</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}