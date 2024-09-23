// app/matches/[id]/page.tsx
import { MatchDetails } from '@/components/match-details'

export default function MatchDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Match Details</h1>
      <MatchDetails id={params.id} />
    </div>
  )
}