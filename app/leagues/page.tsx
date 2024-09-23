// app/leagues/page.tsx
import { LeaguesList } from '@/components/leagues-list'

export default function LeaguesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Active Leagues</h1>
      <LeaguesList />
    </div>
  )
}