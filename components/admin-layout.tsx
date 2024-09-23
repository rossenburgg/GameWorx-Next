// components/admin-layout.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminCheck } from '@/hooks/useAdminCheck'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminCheck()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}