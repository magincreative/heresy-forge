'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function UnitSelector({ role, list, onSelect }) {
  const [units, setUnits] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUnits()
  }, [])

  const loadUnits = async () => {
    const { data } = await supabase
      .from('units')
      .select('*')
      .eq('role', role)
      .eq('army', list.army)
    
    if (data) {
      const filteredUnits = data.filter(unit => {
        const matchesAllegiance = unit.allegiances.includes('All') || unit.allegiances.includes(list.allegiance)
        const matchesFaction = unit.factions.includes('All') || unit.factions.includes(list.faction)
        return matchesAllegiance && matchesFaction
      })
      setUnits(filteredUnits)
    }
    
    setLoading(false)
  }

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().startsWith(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-6">
        <input
          type="text"
          placeholder="Search units..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Unit List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h5 className="pb-2">Available Units:</h5>
        {loading ? (
          <p className="text-center">Loading units...</p>
        ) : filteredUnits.length === 0 ? (
          <p className="text-center text-gray-500">
            {searchTerm ? `No units match "${searchTerm}"` : 'No units available for this role'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredUnits.map(unit => (
              <button
                key={unit.id}
                onClick={() => onSelect(unit)}
                className="w-full border-2 border-accent rounded-lg p-4"
              >
                <div className="flex justify-between items-start text-left">
                  <div>
                    <h4>{unit.name}</h4>
                    <p className="text-secondary">{unit.role}</p>
                  </div>
                  <h4 className="text-primary">{unit.base_cost} pts</h4>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}