// app/tournaments/page.tsx
"use client"

import { TournamentList } from '@/components/tournament-list'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useAdminCheck } from '@/hooks/useAdminCheck'

export default function TournamentsPage() {
  const { isAdmin } = useAdminCheck()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Tournaments</h1>
        {isAdmin && (
          <Link href="/tournaments/create">
            <Button>Create Tournament</Button>
          </Link>
        )}
      </div>
      <TournamentList />
    </div>
  )
}