'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'

export default function ListSettingsModal({ list, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    army: '',
    faction: '',
    allegiance: '',
    pointsLimit: ''
  })

  const armies = ['Legiones Astartes', 'Solar Auxilia', 'Mechanicum', 'Knights and Titans']
  
  const factions = {
    'Legiones Astartes': [
      'I Dark Angels', 'III Emperor\'s Children', 'IV Iron Warriors', 'V White Scars',
      'VI Space Wolves', 'VII Imperial Fists', 'VIII Night Lords', 'IX Blood Angels',
      'X Iron Hands', 'XII World Eaters', 'XIII Ultramarines', 'XIV Death Guard',
      'XV Thousand Sons', 'XVI Sons of Horus', 'XVII Word Bearers', 'XVIII Salamanders',
      'XIX Raven Guard', 'XX Alpha Legion', 'Knights Errant'
    ],
    'Solar Auxilia': ['All'],
    'Mechanicum': ['All'],
    'Knights and Titans': ['All']
  }

  const allegiances = ['Loyalist', 'Traitor']

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name || '',
        army: list.army || '',
        faction: list.faction || '',
        allegiance: list.allegiance || '',
        pointsLimit: list.pointsLimit || ''
      })
    }
  }, [list])

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.army || !formData.faction || !formData.allegiance) {
      alert('Please fill in all required fields')
      return
    }
    
    const updatedList = {
      ...list,
      name: formData.name.trim(),
      army: formData.army,
      faction: formData.faction,
      allegiance: formData.allegiance,
      pointsLimit: formData.pointsLimit ? parseInt(formData.pointsLimit) : null
    }
    
    onSave(updatedList)
  }

  return (
    <Modal title="List Settings" onClose={onClose}>
      <div className="space-y-6">
        {/* List Name */}
        <div>
          <h5 className="mb-2">+ Designation +</h5>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full focus:border-transparent"
            placeholder="e.g., Nebukar's Spear"
          />
        </div>

        {/* Army */}
        <div>
          <h5 className="mb-4">+ Army +</h5>
          <div className="grid grid-cols-2 gap-4">
            {armies.map(army => (
              <button
                key={army}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, army, faction: '' }))}
                className={`btn ${
                  formData.army === army ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {army}
              </button>
            ))}
          </div>
        </div>

        {/* Faction */}
        <div>
          <h5 className="mb-4">+ Faction +</h5>
          {!formData.army ? (
            <p className="text-secondary">Choose your army type first</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {factions[formData.army].map(faction => (
                <button
                  key={faction}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, faction }))}
                  className={`btn ${
                    formData.faction === faction ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {faction}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Allegiance */}
        <div>
          <h5 className="mb-4">+ Allegiance +</h5>
          <div className="grid grid-cols-2 gap-4">
            {allegiances.map(allegiance => (
              <button
                key={allegiance}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, allegiance }))}
                className={`btn ${
                  formData.allegiance === allegiance ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {allegiance}
              </button>
            ))}
          </div>
        </div>

        {/* Points Limit */}
        <div>
          <h5 className="mb-2">Points Limit (Optional)</h5>
          <input
            type="number"
            value={formData.pointsLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, pointsLimit: e.target.value }))}
            className="w-full focus:border-transparent"
            placeholder="e.g., 2000"
            min="0"
          />
          <p className="mt-1 text-sm text-secondary">Leave empty for no limit</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSave}
            className="flex-1 btn btn-primary"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
