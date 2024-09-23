"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TournamentForm } from "@/components/admin/tournament-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Tournament = {
  id: number;
  name: string;
  game: string;
  status: string;
  startDate: string;
  prizePool: number;
}

const initialTournaments: Tournament[] = [
  { id: 1, name: "Spring Showdown", game: "Rocket League", status: "Upcoming", startDate: "2024-03-15", prizePool: 10000 },
  { id: 2, name: "Summer Clash", game: "League of Legends", status: "Active", startDate: "2024-06-01", prizePool: 25000 },
  { id: 3, name: "Fall Invitational", game: "Valorant", status: "Completed", startDate: "2023-09-10", prizePool: 15000 },
]

export default function TournamentsAdmin() {
  const [tournaments, setTournaments] = useState(initialTournaments)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)

  const handleCreate = (newTournament: Omit<Tournament, 'id'>) => {
    const id = Math.max(...tournaments.map(t => t.id)) + 1
    setTournaments([...tournaments, { id, ...newTournament }])
    setIsDialogOpen(false)
  }

  const handleEdit = (updatedTournament: Tournament) => {
    setTournaments(tournaments.map(t => t.id === updatedTournament.id ? updatedTournament : t))
    setIsDialogOpen(false)
    setEditingTournament(null)
  }

  const handleDelete = (id: number) => {
    setTournaments(tournaments.filter(t => t.id !== id))
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
            <TableHead>Start Date</TableHead>
            <TableHead>Prize Pool</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tournaments.map((tournament) => (
            <TableRow key={tournament.id}>
              <TableCell>{tournament.id}</TableCell>
              <TableCell>{tournament.name}</TableCell>
              <TableCell>{tournament.game}</TableCell>
              <TableCell>{tournament.status}</TableCell>
              <TableCell>{tournament.startDate}</TableCell>
              <TableCell>${tournament.prizePool.toLocaleString()}</TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTournament ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
          </DialogHeader>
          <TournamentForm 
            tournament={editingTournament || undefined}
            onSubmit={editingTournament ? handleEdit : handleCreate}
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