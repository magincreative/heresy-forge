'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'

export default function WeaponListFormModal({ weaponList, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    weapons: []
  })

  const [weaponInput, setWeaponInput] = useState({
    name: '',
    cost: 0
  })

  useEffect(() => {
    if (weaponList) {
      setFormData({
        name: weaponList.name || '',
        weapons: weaponList.weapons || []
      })
    }
  }, [weaponList])

  const handleAddWeapon = () => {
    if (!weaponInput.name.trim()) {
      alert('Please enter a weapon name')
      return
    }

    const newWeapon = {
      name: weaponInput.name.trim(),
      cost: parseInt(weaponInput.cost) || 0
    }

    setFormData(prev => ({
      ...prev,
      weapons: [...prev.weapons, newWeapon]
    }))

    // Reset input
    setWeaponInput({ name: '', cost: 0 })
  }

  const handleDeleteWeapon = (index) => {
    setFormData(prev => ({
      ...prev,
      weapons: prev.weapons.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateWeapon = (index, field, value) => {
    const updated = [...formData.weapons]
    updated[index] = {
      ...updated[index],
      [field]: field === 'cost' ? (parseInt(value) || 0) : value
    }
    setFormData(prev => ({ ...prev, weapons: updated }))
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a weapon list name')
      return
    }

    if (formData.weapons.length === 0) {
      alert('Please add at least one weapon')
      return
    }

    onSave(formData)
  }

  return (
    <Modal title={weaponList ? 'Edit Weapon List' : 'Create Weapon List'} onClose={onClose}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* Weapon List Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Weapon List Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
            placeholder="e.g., Melee Weapons"
          />
        </div>

        {/* Add Weapon Section */}
        <div className="border border-accent rounded-lg p-4">
          <h5 className="mb-4">Add Weapon</h5>
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-8">
              <input
                type="text"
                value={weaponInput.name}
                onChange={(e) => setWeaponInput(prev => ({ ...prev, name: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddWeapon()
                  }
                }}
                className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
                placeholder="Weapon name (e.g., Power Sword)"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                value={weaponInput.cost}
                onChange={(e) => setWeaponInput(prev => ({ ...prev, cost: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddWeapon()
                  }
                }}
                className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
                placeholder="Cost"
                min="0"
              />
            </div>
            <div className="col-span-1 flex items-center">
              <button
                onClick={handleAddWeapon}
                className="btn btn-primary w-full"
                title="Add Weapon"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-xs text-secondary">Press Enter or click + to add</p>
        </div>

        {/* Weapons List */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Weapons ({formData.weapons.length})
          </label>
          {formData.weapons.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-accent/50 rounded text-secondary">
              No weapons yet. Add your first weapon above.
            </div>
          ) : (
            <div className="space-y-2">
              {formData.weapons.map((weapon, index) => (
                <div key={index} className="bg-accent/10 border border-accent/30 rounded p-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8">
                      <input
                        type="text"
                        value={weapon.name}
                        onChange={(e) => handleUpdateWeapon(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-accent rounded bg-background text-white text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={weapon.cost}
                        onChange={(e) => handleUpdateWeapon(index, 'cost', e.target.value)}
                        className="w-full px-2 py-1 border border-accent rounded bg-background text-white text-sm"
                        min="0"
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        onClick={() => handleDeleteWeapon(index)}
                        className="text-danger hover:opacity-80 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview JSON */}
        {formData.weapons.length > 0 && (
          <div className="border border-accent/50 rounded p-4 bg-accent/5">
            <h5 className="mb-2">JSON Preview:</h5>
            <pre className="text-xs text-secondary overflow-x-auto">
              {JSON.stringify(formData.weapons, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-background">
          <button
            onClick={handleSave}
            className="flex-1 btn btn-primary"
          >
            {weaponList ? 'Save Changes' : 'Create Weapon List'}
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