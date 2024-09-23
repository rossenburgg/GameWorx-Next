// app/tournaments/create/page.tsx
import { CreateTournamentForm } from '@/components/create-tournament-form'

export default function CreateTournamentPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Create Tournament</h1>
      <CreateTournamentForm />
    </div>
  )
}