// components/team-members-management.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase'
import { showToast } from "@/lib/utils"

const ROLES = ['Admin', 'In-game Leader', 'Roam', 'Assaulter']

export function TeamMembersManagement({ teamId }: { teamId: string }) {
  const [members, setMembers] = useState([])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Player')
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAdminAndFetchMembers() {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
      
      if (error) {
        console.error('Error fetching team members:', error)
        showToast('Error', 'Failed to fetch team members', "destructive")
      } else {
        setMembers(data)
        const adminMember = data.find(member => 
          member.user_id === user.id && member.role === 'Admin'
        )
        setIsAdmin(!!adminMember)
        if (!adminMember) {
          showToast('Access Denied', 'Only team admins can manage members.', "destructive")
          router.push(`/teams/${teamId}`)
        }
      }
      setLoading(false)
    }

    checkAdminAndFetchMembers()
  }, [teamId, router])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return

    setLoading(true)
    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, name: newMemberName, role: newMemberRole })
      .select()
    
    if (error) {
      showToast('Error', 'Failed to add team member', "destructive")
    } else {
      showToast('Success', 'Team member added successfully')
      setNewMemberName('')
      setNewMemberRole('Player')
      setMembers([...members, data[0]])
    }
    setLoading(false)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) return

    setLoading(true)
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
    
    if (error) {
      showToast('Error', 'Failed to remove team member', "destructive")
    } else {
      showToast('Success', 'Team member removed successfully')
      setMembers(members.filter(member => member.id !== memberId))
    }
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return <div>You do not have permission to manage team members.</div>
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading}>Add Member</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      {member.role !== 'Admin' && (
                        <Button 
                          variant="destructive" 
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No team members yet.</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={() => router.push(`/teams/${teamId}`)}>Back to Team Details</Button>
    </div>
  )
}