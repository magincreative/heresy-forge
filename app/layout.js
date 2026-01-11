'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import '../styles/globals.css'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/authUtils'

function HeaderAuthButton() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      router.push('/')
      router.refresh()
    }
  }

  if (loading) {
    return <div className="text-secondary text-sm">Loading...</div>
  }

  if (user) {
    return (
      <div className="relative">
        {/* User Icon Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <svg
            className="w-5 h-5 text-background"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-12 z-50">
            <div className="bg-[#1b2534] flex flex-col gap-3 items-center px-8 py-6 min-w-[250px]">
              <p className="text-white text-sm tracking-wide">
                {user.email}
              </p>
              <button
                onClick={handleSignOut}
                className="border-2 border-accent text-accent px-3 py-2 font-semibold text-base tracking-wide hover:bg-accent hover:text-background transition-colors"
              >
                SIGN OUT
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Link href="/login" className="btn btn-secondary btn-lg">
      Sign In
    </Link>
  )
}

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const hideHeader = pathname === '/login'

  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          {!hideHeader && (
            <nav className="p-4 mb-8">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                  <h1 className="leading">Heresy Forge Army Builder</h1>
                </Link>
                <HeaderAuthButton />
              </div>
            </nav>
          )}
          <main className={hideHeader ? '' : 'container mx-auto px-4'}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}