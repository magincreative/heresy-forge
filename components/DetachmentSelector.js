'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DetachmentSelector({ type, list, onSelect }) {
  const [detachments, setDetachments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDetachments()
  }, [])

  const loadDetachments = async () => {
    const { data } = await supabase
      .from('detachments')
      .select('*')
      .eq('type', type)
    
    if (data) {
      // Filter by army/faction if needed
        const filteredDetachments = data.filter(det => {
        const matchesArmy = det.armies.includes('All') || det.armies.includes(list.army)
        const matchesFaction = det.factions.includes('All') || det.factions.includes(list.faction)
        return matchesArmy && matchesFaction
      })
      setDetachments(filteredDetachments)
    }
    
    setLoading(false)
  }

  return (
    <div className="p-6">
      {loading ? (
        <p className="text-center text-tertiary">Loading detachments...</p>
      ) : detachments.length === 0 ? (
        <p className="text-center">No {type} detachments available</p>
      ) : (
        <div className="space-y-2">
          {detachments.map(det => (
            <button
              key={det.id}
              onClick={() => onSelect(det)}
              className="w-full text-left border-2 border-accent rounded-lg p-4 hover:bg-color-primary"
            >
              <h4 className="mb-2">{det.name}</h4>
              <p className="text-secondary">{det.type} Detachment</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}