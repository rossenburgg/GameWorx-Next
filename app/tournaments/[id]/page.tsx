// app/tournaments/[id]/page.tsx
import { TournamentDetails } from '@/components/tournament-details'

export default function TournamentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <TournamentDetails id={params.id} />
    </div>
  )
}