// components/admin/tournament-form.tsx
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

type TournamentFormProps = {
  tournament?: Tournament;
  onSubmit: (tournament: Omit<Tournament, 'id' | 'current_participants'>) => Promise<void>;
  onCancel: () => void;
}


export default function TournamentForm({ tournament, onSubmit, onCancel }: TournamentFormProps) {
  const [name, setName] = useState(tournament?.name || '')
  const [date, setDate] = useState(tournament?.date || '')
  const [prizePool, setPrizePool] = useState(tournament?.prize_pool?.toString() || '')
  const [maxParticipants, setMaxParticipants] = useState(tournament?.max_participants?.toString() || '')
  const [status, setStatus] = useState(tournament?.status || 'Upcoming')
  const [imageUrl, setImageUrl] = useState(tournament?.image_url || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      date,
      prize_pool: Number(prizePool),
      max_participants: Number(maxParticipants),
      status,
      image_url: imageUrl
    } as Omit<Tournament, 'id' | 'current_participants'>)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Tournament Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="prizePool">Prize Pool</Label>
        <Input id="prizePool" type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="maxParticipants">Max Participants</Label>
        <Input id="maxParticipants" type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Registration">Registration</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{tournament ? 'Update' : 'Create'} Tournament</Button>
      </div>
    </form>
  )
}