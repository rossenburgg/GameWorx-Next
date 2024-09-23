// components/team-details.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DetailSkeleton } from "@/components/skeletons"
import { supabase } from '@/lib/supabase'

export function TeamDetails({ id }: { id: string }) {
  const [team, setTeam] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchTeamAndCheckAdmin() {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Error fetching team:', error)
      } else {
        setTeam(data)
        // Check if the current user is the admin
        const adminMember = data.team_members.find(member => 
          member.user_id === user.id && member.role === 'Admin'
        )
        setIsAdmin(!!adminMember)
      }
      setLoading(false)
    }

    fetchTeamAndCheckAdmin()
  }, [id])

  const handleManageMembers = () => {
    router.push(`/teams/${id}/members`)
  }

  if (loading) {
    return <DetailSkeleton />
  }

  if (!team) {
    return <div>Team not found</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">{team.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Game:</strong> {team.game}</p>
          <p><strong>Rating:</strong> {team.rating}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {team.team_members && team.team_members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.team_members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No team members yet.</p>
          )}
        {isAdmin && (
            <Link href={`/teams/${id}/members`} passHref>
              <Button className="mt-4">Manage Team Members</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {team.achievements && team.achievements.length > 0 ? (
            <ul className="list-disc pl-5">
              {team.achievements.map((achievement) => (
                <li key={achievement.id}>{achievement.title} ({achievement.date})</li>
              ))}
            </ul>
          ) : (
            <p>No achievements yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}