// hooks/useAdminCheck.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('user_roles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error checking admin status:', error)
        } else {
          setIsAdmin(data?.is_admin || false)
        }
      }
      setLoading(false)
    }

    checkAdminStatus()
  }, [])

  return { isAdmin, loading }
}