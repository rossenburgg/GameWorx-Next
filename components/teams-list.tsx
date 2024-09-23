// components/teams-list.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { CardSkeleton } from "@/components/skeletons"
import { supabase } from '@/lib/supabase'

export function TeamsList() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
      
      if (error) {
        console.error('Error fetching teams:', error)
      } else {
        setTeams(data)
      }
      setLoading(false)
    }

    fetchTeams()
  }, [])

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.game.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <Input
        className="max-w-sm mb-4"
        placeholder="Search teams..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : filteredTeams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2"><strong>Game:</strong> {team.game}</p>
                  <p className="mb-4"><strong>Rating:</strong> {team.rating}</p>
                  <Link href={`/teams/${team.id}`}>
                    <Button>View Team</Button>
                  </Link>
                </CardContent>
              </Card>
            ))
        }
      </div>
    </div>
  )
}