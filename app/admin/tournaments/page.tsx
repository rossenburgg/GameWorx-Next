"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TournamentForm from "@/components/admin/tournament-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase'

type Tournament = {
  id: number;
  name: string;
  date: string;
  prize_pool: number;
  max_participants: number;
  current_participants: number;
  status: string;
  image_url: string;
};

const initialTournaments: Tournament[] = [
  { id: 1, name: "Spring Showdown", status: "Upcoming", date: "2024-03-15", prize_pool: 10000, max_participants: 32, current_participants: 0, image_url: "https://example.com/spring-showdown.jpg" },
  { id: 2, name: "Summer Clash", status: "Registration", date: "2024-06-01", prize_pool: 25000, max_participants: 16, current_participants: 8, image_url: "https://example.com/summer-clash.jpg" },
  { id: 3, name: "Fall Invitational", status: "Completed", date: "2023-09-10", prize_pool: 15000, max_participants: 8, current_participants: 8, image_url: "https://example.com/fall-invitational.jpg" },
]

export default function TournamentsAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)

  useEffect(() => {
    fetchTournaments()
  }, [])

  async function fetchTournaments() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
    if (error) console.error('Error fetching tournaments:', error)
    else setTournaments(data || initialTournaments)
  }
  const handleCreate = async (newTournament: Omit<Tournament, 'id' | 'current_participants'>) => {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{ ...newTournament, current_participants: 0 }])
      .select()
    if (error) console.error('Error creating tournament:', error)
    else {
      setTournaments([...tournaments, data[0]])
      setIsDialogOpen(false)
    }
  }
  
  const handleEdit = async (updatedTournament: Tournament) => {
    const { error } = await supabase
      .from('tournaments')
      .update(updatedTournament)
      .eq('id', updatedTournament.id)
    if (error) {
      console.error('Error updating tournament:', error)
    } else {
      setTournaments(tournaments.map(t => t.id === updatedTournament.id ? updatedTournament : t))
      setIsDialogOpen(false)
      setEditingTournament(null)
    }
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id)
    if (error) console.error('Error deleting tournament:', error)
    else {
      setTournaments(tournaments.filter(t => t.id !== id))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Tournaments</h1>
        <Button onClick={() => setIsDialogOpen(true)}>Create New Tournament</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Game</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Prize Pool</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tournaments.map((tournament) => (
            <TableRow key={tournament.id}>
              <TableCell>{tournament.id}</TableCell>
              <TableCell>{tournament.name}</TableCell>
              <TableCell>{tournament.status}</TableCell>
              <TableCell>{tournament.date}</TableCell>
              <TableCell>${tournament.prize_pool.toLocaleString()}</TableCell>
              <TableCell>{tournament.current_participants} / {tournament.max_participants}</TableCell>
              <TableCell>
                <Button variant="outline" className="mr-2" onClick={() => {
                  setEditingTournament(tournament)
                  setIsDialogOpen(true)
                }}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(tournament.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
          </DialogHeader>
          <TournamentForm 
            tournament={editingTournament || undefined}
            onSubmit={async (tournamentData) => {
              if (editingTournament) {
                await handleEdit({ 
                  ...editingTournament, 
                  ...tournamentData as Omit<Tournament, 'id' | 'current_participants'>
                });
              } else {
                await handleCreate(tournamentData as Omit<Tournament, 'id' | 'current_participants'>);
              }
            }}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingTournament(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}