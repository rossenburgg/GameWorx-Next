// app/matches/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { MatchList } from '@/components/match-list'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useAdminCheck } from '@/hooks/useAdminCheck'

export default function MatchesPage() {
  const { isAdmin, loading } = useAdminCheck()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Matches</h1>
        {isAdmin && (
          <Link href="/matches/schedule">
            <Button>Schedule Match</Button>
          </Link>
        )}
      </div>
      <MatchList />
    </div>
  )
}