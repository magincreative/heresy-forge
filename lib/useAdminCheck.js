'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAdminCheck() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      // Get fresh user data directly from Supabase (don't rely on AuthContext)
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log('👤 Fresh user data:', user?.user_metadata)
      
      if (error || !user) {
        console.log('❌ No user - redirecting to home')
        router.push('/')
        return
      }

      const adminStatus = user.user_metadata?.is_admin === true
      console.log('🔑 Is Admin:', adminStatus)
      
      if (!adminStatus) {
        console.log('❌ Not admin - redirecting')
        router.push('/')
        return
      }

      setIsAdmin(true)
      setIsLoading(false)
      console.log('✅ Admin access granted')
    }

    checkAdmin()
  }, [router])

  return { isAdmin, isLoading }
}