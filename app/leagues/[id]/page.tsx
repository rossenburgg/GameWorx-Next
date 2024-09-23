// app/leagues/[id]/page.tsx
import { LeagueDetails } from '@/components/league-details'

export default function LeagueDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <LeagueDetails id={params.id} />
    </div>
  )
}