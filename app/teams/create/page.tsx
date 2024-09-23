// app/teams/create/page.tsx
import { CreateTeamForm } from '@/components/create-team-form'

export default function CreateTeamPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Create a New Team</h1>
      <CreateTeamForm />
    </div>
  )
}