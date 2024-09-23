// app/teams/page.tsx
import { TeamsList } from '@/components/teams-list'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function TeamsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Teams</h1>
        <Link href="/teams/create">
          <Button>Create Team</Button>
        </Link>
      </div>
      <TeamsList />
    </div>
  )
}