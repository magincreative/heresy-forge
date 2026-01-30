'use client'

import { useAdminCheck } from '@/lib/useAdminCheck'
import Link from 'next/link'

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdminCheck()

  // Show loading while checking admin status
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center">
          <p className="text-secondary">Checking admin access...</p>
        </div>
      </div>
    )
  }

  // If not admin, hook will redirect - this won't render
  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="mb-6">Admin Dashboard</h2>
      
      <div className="card p-6">
        <p className="text-secondary mb-4">
          Welcome! You have admin access.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/units">
            <div className="border-2 border-accent rounded-lg p-4 hover:bg-accent/10 cursor-pointer transition-colors">
              <h4 className="mb-2">Units</h4>
              <p className="text-secondary text-sm">Manage game units</p>
            </div>
          </Link>
          
          <div className="border-2 border-accent rounded-lg p-4">
            <h4 className="mb-2">Detachments</h4>
            <p className="text-secondary text-sm">Manage detachments</p>
          </div>
          
          <div className="border-2 border-accent rounded-lg p-4">
            <h4 className="mb-2">Prime Benefits</h4>
            <p className="text-secondary text-sm">Manage benefits</p>
          </div>
          
          <Link href="/admin/weapon-lists">
            <div className="border-2 border-accent rounded-lg p-4 hover:bg-accent/10 cursor-pointer transition-colors">
              <h4 className="mb-2">Weapon Lists</h4>
              <p className="text-secondary text-sm">Manage weapons</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}