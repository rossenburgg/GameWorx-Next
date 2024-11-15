"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LeagueForm } from "@/components/admin/league-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase'

type League = {
  id: number;
  name: string;
  game: string;
  status: string;
  prize_pool: number;
  team_size: string;
  participants: string;
  organizer: { name: string; avatar: string };
  end_date: string;
  logo_url: string;
  platform: string;
  type: string;
}

export default function LeaguesAdmin() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLeague, setEditingLeague] = useState<League | null>(null)

  useEffect(() => {
    fetchLeagues()
  }, [])

  async function fetchLeagues() {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
    if (error) console.error('Error fetching leagues:', error)
    else setLeagues(data || [])
  }

  const handleCreate = async (newLeague: Omit<League, 'id'>): Promise<void> => {
    const { data, error } = await supabase
      .from('leagues')
      .insert([newLeague])
      .select()
    if (error) console.error('Error creating league:', error)
    else {
      setLeagues([...leagues, data[0]])
      setIsDialogOpen(false)
    }
  }

  const handleEdit = async (updatedLeague: League): Promise<void> => {
    const { error } = await supabase
      .from('leagues')
      .update(updatedLeague)
      .eq('id', updatedLeague.id) 
    if (error) {
      console.error('Error updating league:', error)
    } else {
      setLeagues(leagues.map(l => l.id === updatedLeague.id ? updatedLeague : l))
      setIsDialogOpen(false)
      setEditingLeague(null)
    }
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', id)
    if (error) console.error('Error deleting league:', error)
    else {
      setLeagues(leagues.filter(l => l.id !== id))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Leagues</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Create New League</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prize Pool</TableHead>
            <TableHead>Team Size</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leagues.map((league) => (
            <TableRow key={league.id}>
              <TableCell>{league.id}</TableCell>
              <TableCell>{league.name}</TableCell>
              <TableCell>{league.game}</TableCell>
              <TableCell>{league.status}</TableCell>
              <TableCell>${league.prize_pool?.toLocaleString()}</TableCell>
              <TableCell>{league.team_size}</TableCell>
              <TableCell>{league.participants}</TableCell>
              <TableCell>{league.organizer?.name}</TableCell>
              <TableCell>{league.end_date}</TableCell>
              <TableCell>
                <Button variant="outline" className="mr-2" onClick={() => {
                  setEditingLeague(league)
                  setIsDialogOpen(true)
                }}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(league.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLeague ? 'Edit League' : 'Create New League'}</DialogTitle>
          </DialogHeader>
          <LeagueForm 
            league={editingLeague || undefined}
            onSubmit={async (league) => {
              if (editingLeague) {
                await handleEdit({...league, id: editingLeague.id});
              } else {
                await handleCreate(league);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingLeague(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}