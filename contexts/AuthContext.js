'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from '@/lib/authUtils'
import { syncLocalToCloud } from '@/lib/listSyncUtils'

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasSynced, setHasSynced] = useState(false)

  useEffect(() => {
    // Get initial session
    getCurrentUser().then(({ user, session }) => {
      setUser(user)
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      const newUser = session?.user || null
      
      setUser(newUser)
      setSession(session)
      setLoading(false)

      // If user just signed in and we haven't synced yet
      if (event === 'SIGNED_IN' && newUser && !hasSynced) {
        console.log('User signed in, syncing local lists to cloud...')
        const result = await syncLocalToCloud(newUser.id)
        
        if (result.success) {
          console.log(`✅ Synced ${result.syncedCount} lists to cloud`)
          if (result.failedCount > 0) {
            console.warn(`⚠️ ${result.failedCount} lists failed to sync`)
          }
          setHasSynced(true)
        } else {
          console.error('❌ Failed to sync lists:', result.error)
        }
      }

      // Reset sync flag on sign out
      if (event === 'SIGNED_OUT') {
        setHasSynced(false)
      }
    })

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [hasSynced])

  const value = {
    user,
    session,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
