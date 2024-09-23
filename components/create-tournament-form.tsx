// components/create-tournament-form.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { showToast } from "@/lib/utils"

export function CreateTournamentForm() {
  const [name, setName] = useState('')
  const [game, setGame] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [prizePool, setPrizePool] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        game,
        start_date: startDate,
        end_date: endDate,
        description,
        prize_pool: parseFloat(prizePool)
      })

    if (error) {
      console.error('Error creating tournament:', error)
      showToast('Error creating tournament', error.message, "destructive")
    } else {
      showToast('Tournament created successfully', 'Your tournament has been created.')
      router.push('/tournaments')
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Tournament</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Tournament Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="prizePool">Prize Pool ($)</Label>
            <Input
              id="prizePool"
              type="number"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}