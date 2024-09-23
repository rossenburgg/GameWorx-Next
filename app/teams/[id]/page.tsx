// app/teams/[id]/page.tsx
import { TeamDetails } from '@/components/team-details'

export default function TeamPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <TeamDetails id={params.id} />
    </div>
  )
}