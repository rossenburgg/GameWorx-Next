import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

type LeagueFormProps = {
  league?: League;
  onSubmit: (league: Omit<League, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function LeagueForm({ league, onSubmit, onCancel }: LeagueFormProps) {
  const [name, setName] = useState(league?.name || '')
  const [game, setGame] = useState(league?.game || '')
  const [status, setStatus] = useState(league?.status || 'Upcoming')
  const [prizePool, setPrizePool] = useState(league?.prize_pool?.toString() || '')
  const [teamSize, setTeamSize] = useState(league?.team_size || '')
  const [participants, setParticipants] = useState(league?.participants || '')
  const [organizerName, setOrganizerName] = useState(league?.organizer?.name || '')
  const [organizerAvatar, setOrganizerAvatar] = useState(league?.organizer?.avatar || '')
  const [endDate, setEndDate] = useState(league?.end_date || '')
  const [logoUrl, setLogoUrl] = useState(league?.logo_url || '')
  const [platform, setPlatform] = useState(league?.platform || '')
  const [type, setType] = useState(league?.type || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      game,
      status,
      prize_pool: Number(prizePool),
      team_size: teamSize,
      participants,
      organizer: { name: organizerName, avatar: organizerAvatar },
      end_date: endDate,
      logo_url: logoUrl,
      platform,
      type
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">League Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="game">Game</Label>
        <Input id="game" value={game} onChange={(e) => setGame(e.target.value)} required />
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
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="prizePool">Prize Pool</Label>
        <Input id="prizePool" type="number" value={prizePool} onChange={(e) => setPrizePool(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="teamSize">Team Size</Label>
        <Input id="teamSize" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="participants">Participants</Label>
        <Input id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="organizerName">Organizer Name</Label>
        <Input id="organizerName" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="organizerAvatar">Organizer Avatar URL</Label>
        <Input id="organizerAvatar" value={organizerAvatar} onChange={(e) => setOrganizerAvatar(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="platform">Platform</Label>
        <Input id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Input id="type" value={type} onChange={(e) => setType(e.target.value)} required />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{league ? 'Update' : 'Create'} League</Button>
      </div>
    </form>
  )
}