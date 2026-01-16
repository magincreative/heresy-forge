'use client'

import Link from 'next/link'
import Snackbar from '@/components/Snackbar'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { loadListsFromCloud, deleteListFromCloud, getLocalLists, saveLocalLists } from '@/lib/listSyncUtils'

// Helper function to format relative time
const getTimeAgo = (dateString) => {
  if (!dateString) return 'recently'
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'recently'
  
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  }
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''}`
    }
  }
  
  return 'just now'
}

export default function ListsPage() {
  const [lists, setLists] = useState([])
  const [snackbar, setSnackbar] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadLists()
  }, [user])

  const loadLists = async () => {
    setLoading(true)
    
    if (user) {
      // Logged in - load from cloud
      const result = await loadListsFromCloud(user.id)
      if (result.success) {
        setLists(result.lists)
      } else {
        console.error('Failed to load lists from cloud:', result.error)
        // Fallback to local storage
        setLists(getLocalLists())
      }
    } else {
      // Guest - load from localStorage
      setLists(getLocalLists())
    }
    
    setLoading(false)
  }

  const handleDelete = async (listId) => {
    const listToDelete = lists.find(list => list.id === listId || `list-${list.id}` === listId)
    const updatedLists = lists.filter(list => list.id !== listId && `list-${list.id}` !== listId)
    
    // Update state immediately
    setLists(updatedLists)
    
    // Delete from appropriate storage
    if (user) {
      // Logged in - delete from cloud
      const cleanId = listId.replace('list-', '')
      const result = await deleteListFromCloud(cleanId, user.id)
      if (!result.success) {
        console.error('Failed to delete from cloud:', result.error)
        // Restore list on error
        setLists([...updatedLists, listToDelete])
        return
      }
    } else {
      // Guest - delete from localStorage
      saveLocalLists(updatedLists)
    }
    
    // Show undo snackbar
    setSnackbar({
      message: `"${listToDelete.name}" deleted`,
      onUndo: async () => {
        const restoredLists = [...updatedLists, listToDelete]
        setLists(restoredLists)
        
        if (user) {
          // Re-save to cloud
          const { saveListToCloud } = await import('@/lib/listSyncUtils')
          await saveListToCloud(listToDelete, user.id)
        } else {
          saveLocalLists(restoredLists)
        }
      }
    })
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Army Lists</h2>
        <Link 
          href="/create-list"
          className="btn btn-primary btn-lg"
        >
          Create New List
        </Link>
      </div>

      {loading ? (
        /* Loading state */
        <div className="rounded-lg shadow p-8 text-center">
          <p className="text-secondary">Loading your lists...</p>
        </div>
      ) : lists.length === 0 ? (
        /* Empty state */
        <div className=" rounded-lg shadow p-8 text-center">
          <p className="text-secondary mb-4">You haven't created any army lists yet.</p>
          <p className="text-secondary">Click "Create New List" to get started!</p>
        </div>
      ) : (
        /* List grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lists.map(list => (
            <div key={list.id} className="flex flex-col space-between gap-4 border-2 border-accent rounded-lg p-4">
              <Link key={list.id} href={`/list/${list.id}`}>
                <div className="flex flex-row gap-4 justify-between items-center">
                  <h3 className="mb-2">{list.name}</h3>
                  {list.pointsLimit && (
                    <h4>
                      {list.totalPoints} / {list.pointsLimit} pts
                    </h4>
                  )}
                  {!list.pointsLimit && (
                    <h4>
                      {list.totalPoints} pts
                    </h4>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-secondary">{list.army}</p>
                  <p className="text-secondary">{list.faction} • {list.allegiance}</p>
                </div>
              </Link>
              
              {/* Action buttons */}
              <div className="flex flex-row gap-4">
                <Link href={`/list/${list.id}`} className="btn btn-secondary w-full">
                  Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(list.id)
                  }}
                  className="btn btn-danger w-full"
                >
                  Delete
                </button>
              </div>
              <div className="text-secondary">
                <span>
                  Updated {getTimeAgo(list.updatedAt)} ago
                </span>

              </div>
            </div>
          ))}
        </div>
      )}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          onUndo={snackbar.onUndo}
          onClose={() => setSnackbar(null)}
        />
      )}
    </>
  )
}