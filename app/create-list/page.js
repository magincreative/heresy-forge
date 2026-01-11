'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { saveListToCloud, saveLocalLists, getLocalLists } from '@/lib/listSyncUtils'

export default function CreateListPage() {
  const router = useRouter()
  const { user } = useAuth()
  
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset faction when army changes
      ...(name === 'army' ? { faction: '' } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.army || !formData.faction || !formData.allegiance) {
      alert('Please fill in all required fields')
      return
    }

    // Generate a unique ID for the list
    const listId = user ? crypto.randomUUID() : `list-${crypto.randomUUID()}`
    
    // Create list object
    const newList = {
      id: listId,
      name: formData.name,
      army: formData.army,
      faction: formData.faction,
      allegiance: formData.allegiance,
      pointsLimit: formData.pointsLimit ? parseInt(formData.pointsLimit) : null,
      totalPoints: 0,
      isValid: true,
      detachments: [{
        id: `det-${Date.now()}`,
        detachmentId: 'crusade-primary',
        name: 'Crusade Primary Detachment',
        type: 'Primary',
        isValid: true,
        totalPoints: 0,
        triggeredBy: null,
        units: [],
        addedRoles: []
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (user) {
      // Logged in - save to cloud + localStorage
      const result = await saveListToCloud(newList, user.id)
      if (result.success) {
        console.log('✅ List saved to cloud')
        // Also save to localStorage as backup
        const existingLists = getLocalLists()
        existingLists.push(newList)
        saveLocalLists(existingLists)
      } else {
        console.error('Failed to save to cloud:', result.error)
        alert('Failed to save list. Please try again.')
        return
      }
    } else {
      // Guest - save to localStorage only
      const existingLists = getLocalLists()
      existingLists.push(newList)
      saveLocalLists(existingLists)
    }

    // Redirect to the new list
    router.push(`/list/${listId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="mb-6">Forge your New List</h2>
      
      <form onSubmit={handleSubmit} className=" rounded-lg shadow-md p-6 space-y-6">
        
        {/* Designation */}
        <div>
          <h5 htmlFor="name" className="mb-2">
            + Designation +
          </h5>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Your First Strike Force"
            className="w-full focus:border-transparent"
            required
          />
        </div>

        {/* Army */}
        <div>
          <h5 className="mb-4">
            + Army +
          </h5>
          
          <div className="grid md:grid-cols-2 gap-4">
            {armies.map(army => (
              <button
                key={army}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, army, faction: '' }))}
                className={`btn btn-lg ${
                  formData.army === army ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {army}
              </button>
            ))}
          </div>
        </div>

        {/* Faction Selection */}
        <div>
          <h5 className="mb-4">
            + Faction +
          </h5>
          {!formData.army ? (
            <p className="text-secondary">Choose your army type first</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {factions[formData.army].map(faction => (
                <button
                  key={faction}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, faction }))}
                  className={`btn btn-lg ${
                    formData.faction === faction ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {faction}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Allegiance Selection */}
        <div>
          <h5 className="block mb-4">
            + Allegiance +
          </h5>
          <div className="grid md:grid-col-2 gap-4">
            {allegiances.map(allegiance => (
              <button
                key={allegiance}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, allegiance }))}
                className={`btn btn-lg ${
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
          <h5 htmlFor="pointsLimit" className="mb-2">
            Points Limit (Optional)
          </h5>
          <input
            type="number"
            id="pointsLimit"
            name="pointsLimit"
            value={formData.pointsLimit}
            onChange={handleChange}
            placeholder="e.g., 2000"
            min="0"
            className="w-full focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">Leave empty for no limit</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 btn btn-primary btn-lg"
          >
            Deploy
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn btn-danger btn-lg"
          >
            Abort
          </button>
        </div>
      </form>
    </div>
  )
}