'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'

export default function UnitFormModal({ unit, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    base_cost: '',
    army: '',
    factions: [],
    allegiances: [],
    base_wargear: [],
    special_rules: [],
    unit_composition: [],
    equipment_options: []
  })

  const armies = ['Legiones Astartes', 'Solar Auxilia', 'Mechanicum', 'Knights and Titans']
  const roles = ['High Command', 'Command', 'Troops', 'Elites', 'Fast Attack', 'Heavy Support', 'Lord of War']
  const factionsList = {
    'Legiones Astartes': [
      'All', 'I Dark Angels', 'III Emperor\'s Children', 'IV Iron Warriors', 'V White Scars',
      'VI Space Wolves', 'VII Imperial Fists', 'VIII Night Lords', 'IX Blood Angels',
      'X Iron Hands', 'XII World Eaters', 'XIII Ultramarines', 'XIV Death Guard',
      'XV Thousand Sons', 'XVI Sons of Horus', 'XVII Word Bearers', 'XVIII Salamanders',
      'XIX Raven Guard', 'XX Alpha Legion', 'Knights Errant'
    ],
    'Solar Auxilia': ['All'],
    'Mechanicum': ['All'],
    'Knights and Titans': ['All']
  }
  const allegiancesList = ['All', 'Loyalist', 'Traitor']

  // Text input states for array fields
  const [wargearInput, setWargearInput] = useState('')
  const [specialRuleInput, setSpecialRuleInput] = useState('')
  const [compositionInput, setCompositionInput] = useState('')

  useEffect(() => {
    if (unit) {
      // Editing existing unit
      setFormData({
        name: unit.name || '',
        role: unit.role || '',
        base_cost: unit.base_cost || '',
        army: unit.army || '',
        factions: unit.factions || [],
        allegiances: unit.allegiances || [],
        base_wargear: unit.base_wargear || [],
        special_rules: unit.special_rules || [],
        unit_composition: unit.unit_composition || [],
        equipment_options: unit.equipment_options || []
      })
    }
  }, [unit])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayAdd = (field, value, clearInput) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
      clearInput('')
    }
  }

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const toggleArrayItem = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field]
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter(item => item !== value) }
      } else {
        return { ...prev, [field]: [...currentArray, value] }
      }
    })
  }

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.role || !formData.army) {
      alert('Please fill in Name, Role, and Army')
      return
    }

    if (!formData.base_cost || isNaN(formData.base_cost)) {
      alert('Please enter a valid base cost')
      return
    }

    if (formData.factions.length === 0) {
      alert('Please select at least one faction')
      return
    }

    if (formData.allegiances.length === 0) {
      alert('Please select at least one allegiance')
      return
    }

    const unitData = {
      ...formData,
      base_cost: parseInt(formData.base_cost)
    }

    onSave(unitData)
  }

  return (
    <Modal title={unit ? 'Edit Unit' : 'Create Unit'} onClose={onClose}>
      <div className="space-y-6 max-h-[70vh] pr-2">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Unit Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
            placeholder="e.g., Praetor"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold mb-2">Role *</label>
          <select
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Base Cost */}
        <div>
          <label className="block text-sm font-semibold mb-2">Base Cost (pts) *</label>
          <input
            type="number"
            value={formData.base_cost}
            onChange={(e) => handleChange('base_cost', e.target.value)}
            className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
            placeholder="e.g., 120"
            min="0"
          />
        </div>

        {/* Army */}
        <div>
          <label className="block text-sm font-semibold mb-2">Army *</label>
          <select
            value={formData.army}
            onChange={(e) => {
              handleChange('army', e.target.value)
              handleChange('factions', []) // Reset factions when army changes
            }}
            className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
          >
            <option value="">Select Army</option>
            {armies.map(army => (
              <option key={army} value={army}>{army}</option>
            ))}
          </select>
        </div>

        {/* Factions */}
        {formData.army && (
          <div>
            <label className="block text-sm font-semibold mb-2">Factions * (select all that apply)</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-accent rounded p-2">
              {factionsList[formData.army].map(faction => (
                <label key={faction} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.factions.includes(faction)}
                    onChange={() => toggleArrayItem('factions', faction)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{faction}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-secondary mt-1">
              Selected: {formData.factions.join(', ') || 'None'}
            </p>
          </div>
        )}

        {/* Allegiances */}
        <div>
          <label className="block text-sm font-semibold mb-2">Allegiances * (select all that apply)</label>
          <div className="flex gap-4">
            {allegiancesList.map(allegiance => (
              <label key={allegiance} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allegiances.includes(allegiance)}
                  onChange={() => toggleArrayItem('allegiances', allegiance)}
                  className="w-4 h-4"
                />
                <span className="text-sm">{allegiance}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-secondary mt-1">
            Selected: {formData.allegiances.join(', ') || 'None'}
          </p>
        </div>

        {/* Base Wargear */}
        <div>
          <label className="block text-sm font-semibold mb-2">Base Wargear</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={wargearInput}
              onChange={(e) => setWargearInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleArrayAdd('base_wargear', wargearInput, setWargearInput)
                }
              }}
              className="flex-1 px-3 py-2 border border-accent rounded bg-background text-white"
              placeholder="e.g., Bolter"
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('base_wargear', wargearInput, setWargearInput)}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.base_wargear.map((item, index) => (
              <span key={index} className="bg-[#343434] px-3 py-1 rounded text-sm flex items-center gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('base_wargear', index)}
                  className="text-danger hover:opacity-80"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Special Rules */}
        <div>
          <label className="block text-sm font-semibold mb-2">Special Rules</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={specialRuleInput}
              onChange={(e) => setSpecialRuleInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleArrayAdd('special_rules', specialRuleInput, setSpecialRuleInput)
                }
              }}
              className="flex-1 px-3 py-2 border border-accent rounded bg-background text-white"
              placeholder="e.g., Master of the Legion"
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('special_rules', specialRuleInput, setSpecialRuleInput)}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.special_rules.map((item, index) => (
              <span key={index} className="bg-[#343434] px-3 py-1 rounded text-sm flex items-center gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('special_rules', index)}
                  className="text-danger hover:opacity-80"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Unit Composition */}
        <div>
          <label className="block text-sm font-semibold mb-2">Unit Composition</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={compositionInput}
              onChange={(e) => setCompositionInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleArrayAdd('unit_composition', compositionInput, setCompositionInput)
                }
              }}
              className="flex-1 px-3 py-2 border border-accent rounded bg-background text-white"
              placeholder="e.g., 1 Praetor"
            />
            <button
              type="button"
              onClick={() => handleArrayAdd('unit_composition', compositionInput, setCompositionInput)}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.unit_composition.map((item, index) => (
              <span key={index} className="bg-[#343434] px-3 py-1 rounded text-sm flex items-center gap-2">
                {item}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('unit_composition', index)}
                  className="text-danger hover:opacity-80"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-surface">
          <button
            onClick={handleSave}
            className="flex-1 btn btn-primary"
          >
            {unit ? 'Save Changes' : 'Create Unit'}
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