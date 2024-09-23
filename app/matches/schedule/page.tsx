// app/matches/schedule/page.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ScheduleMatchForm } from '@/components/schedule-match-form'
import { useAdminCheck } from '@/hooks/useAdminCheck'

export default function ScheduleMatchPage() {
  const { isAdmin, loading } = useAdminCheck()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/matches')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Schedule a Match</h1>
      <ScheduleMatchForm />
    </div>
  )
}