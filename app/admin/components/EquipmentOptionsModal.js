'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'
import { supabase } from '@/lib/supabase'

export default function EquipmentOptionsModal({ unit, onSave, onClose }) {
  const [optionGroups, setOptionGroups] = useState([])
  const [editingGroupIndex, setEditingGroupIndex] = useState(null)
  const [weaponLists, setWeaponLists] = useState([])

  useEffect(() => {
    if (unit && unit.equipment_options) {
      setOptionGroups(unit.equipment_options)
    }
    fetchWeaponLists()
  }, [unit])

  async function fetchWeaponLists() {
    // First get the weapon lists
    const { data: lists, error: listsError } = await supabase
      .from('weapon_lists')
      .select('*')
      .order('name', { ascending: true })

    if (listsError) {
      console.error('Error fetching weapon lists:', listsError)
      return
    }

    // Then get all weapon list items
    const { data: items, error: itemsError } = await supabase
      .from('weapon_list_items')
      .select('*')

    if (itemsError) {
      console.error('Error fetching weapon list items:', itemsError)
    }

    // Combine the data: add items to their respective lists
    const listsWithWeapons = (lists || []).map(list => ({
      ...list,
      weapons: (items || [])
        .filter(item => item.list_id === list.id)
        .map(item => ({
          id: item.id,
          name: item.name,
          cost: item.cost
        }))
    }))

    setWeaponLists(listsWithWeapons)
  }

  const handleSave = () => {
    onSave({ equipment_options: optionGroups })
  }

  const addNewGroup = () => {
    const newGroup = {
      label: 'New Option Group',
      type: 'checkbox',
      mutuallyExclusive: false,
      options: []
    }
    setOptionGroups([...optionGroups, newGroup])
    setEditingGroupIndex(optionGroups.length)
  }

  const updateGroup = (index, field, value) => {
    const updated = [...optionGroups]
    updated[index] = { ...updated[index], [field]: value }
    setOptionGroups(updated)
  }

  const deleteGroup = (index) => {
    if (confirm('Delete this equipment group?')) {
      setOptionGroups(optionGroups.filter((_, i) => i !== index))
      if (editingGroupIndex === index) {
        setEditingGroupIndex(null)
      }
    }
  }

  const addOption = (groupIndex, optionType = 'standard') => {
    const updated = [...optionGroups]
    const newOption = {
      type: optionType, // 'standard' or 'weaponList'
      name: '',
      cost: 0,
      replaces: []
    }
    
    if (optionType === 'weaponList') {
      newOption.weaponListId = null
    }
    
    updated[groupIndex].options.push(newOption)
    setOptionGroups(updated)
  }

  const updateOption = (groupIndex, optionIndex, field, value) => {
    const updated = [...optionGroups]
    updated[groupIndex].options[optionIndex][field] = value
    setOptionGroups(updated)
  }

  const deleteOption = (groupIndex, optionIndex) => {
    const updated = [...optionGroups]
    updated[groupIndex].options = updated[groupIndex].options.filter((_, i) => i !== optionIndex)
    setOptionGroups(updated)
  }

  return (
    <Modal title={`Equipment Options: ${unit?.name}`} onClose={onClose}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* Equipment Groups List */}
        <div className="space-y-4">
          {optionGroups.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-accent/50 rounded">
              <p className="text-secondary mb-4">No equipment options yet</p>
              <button onClick={addNewGroup} className="btn btn-primary">
                + Add First Equipment Group
              </button>
            </div>
          ) : (
            <>
              {optionGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="border-2 border-accent rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={group.label}
                        onChange={(e) => updateGroup(groupIndex, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-accent rounded bg-background text-white font-semibold"
                        placeholder="e.g., Replace Bolter and/or Bolt Pistol"
                      />
                    </div>
                    <button
                      onClick={() => deleteGroup(groupIndex)}
                      className="ml-4 text-danger hover:opacity-80 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Group Settings */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm mb-2">Selection Type</label>
                      <select
                        value={group.type}
                        onChange={(e) => updateGroup(groupIndex, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
                      >
                        <option value="checkbox">Checkbox (Multiple)</option>
                        <option value="radio">Radio (Choose One)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Mutually Exclusive?</label>
                      <select
                        value={group.mutuallyExclusive ? 'true' : 'false'}
                        onChange={(e) => updateGroup(groupIndex, 'mutuallyExclusive', e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-accent rounded bg-background text-white"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-semibold">Equipment Options:</label>
                    {group.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="bg-background/50 border border-accent/30 rounded p-3">
                        
                        {/* Standard Option (Name, Cost, Replaces) */}
                        {(!option.type || option.type === 'standard') && (
                          <div className="grid grid-cols-12 gap-2">
                            {/* Option Name */}
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => updateOption(groupIndex, optionIndex, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-accent rounded bg-background text-white text-sm"
                                placeholder="e.g., Paragon Blade"
                              />
                            </div>
                            
                            {/* Cost */}
                            <div className="col-span-2">
                              <input
                                type="number"
                                value={option.cost}
                                onChange={(e) => updateOption(groupIndex, optionIndex, 'cost', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-accent rounded bg-background text-white text-sm"
                                placeholder="Cost"
                                min="0"
                              />
                            </div>
                            
                            {/* Replaces */}
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={option.replaces?.join(', ') || ''}
                                onChange={(e) => {
                                  const replaces = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                  updateOption(groupIndex, optionIndex, 'replaces', replaces)
                                }}
                                className="w-full px-2 py-1 border border-accent rounded bg-background text-white text-sm"
                                placeholder="Replaces (comma sep)"
                              />
                            </div>
                            
                            {/* Delete Button */}
                            <div className="col-span-1 flex items-center">
                              <button
                                onClick={() => deleteOption(groupIndex, optionIndex)}
                                className="text-danger hover:opacity-80 text-xl"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Weapon List Option */}
                        {option.type === 'weaponList' && (
                          <div className="grid grid-cols-12 gap-2">
                            {/* Weapon List Dropdown */}
                            <div className="col-span-11">
                              <select
                                value={option.weaponListId || ''}
                                onChange={(e) => updateOption(groupIndex, optionIndex, 'weaponListId', e.target.value || null)}
                                className="w-full px-2 py-1 border border-accent rounded bg-background text-white text-sm"
                              >
                                <option value="">Select Weapon List...</option>
                                {weaponLists.map(wl => (
                                  <option key={wl.id} value={wl.id}>
                                    {wl.name} ({wl.weapons?.length || 0} weapons)
                                  </option>
                                ))}
                              </select>
                              
                              {/* Show selected weapon list details */}
                              {option.weaponListId && (
                                <div className="mt-2 text-xs text-secondary">
                                  <strong>Selected:</strong>{' '}
                                  {weaponLists.find(wl => wl.id === option.weaponListId)?.name || 'Unknown'}
                                </div>
                              )}
                            </div>
                            
                            {/* Delete Button */}
                            <div className="col-span-1 flex items-center">
                              <button
                                onClick={() => deleteOption(groupIndex, optionIndex)}
                                className="text-danger hover:opacity-80 text-xl"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addOption(groupIndex, 'standard')}
                        className="btn btn-secondary btn-sm"
                      >
                        + Add Option
                      </button>
                      <button
                        onClick={() => addOption(groupIndex, 'weaponList')}
                        className="btn btn-secondary btn-sm"
                      >
                        + Add Weapon List
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addNewGroup}
                className="btn btn-primary w-full"
              >
                + Add Equipment Group
              </button>
            </>
          )}
        </div>

        {/* Preview Section */}
        {optionGroups.length > 0 && (
          <div className="border border-accent/50 rounded p-4 bg-accent/5">
            <h5 className="mb-2">JSON Preview:</h5>
            <pre className="text-xs text-secondary overflow-x-auto">
              {JSON.stringify(optionGroups, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 sticky bottom-0 bg-background">
          <button
            onClick={handleSave}
            className="flex-1 btn btn-primary"
          >
            Save Equipment Options
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