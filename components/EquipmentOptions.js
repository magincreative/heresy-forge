'use client'

import { useState } from 'react'

export default function EquipmentOptions({ optionGroups, selectedEquipment, onEquipmentChange, weaponListMetadata = {} }) {
  const handleToggleCheckbox = (option) => {
    const isSelected = selectedEquipment.some(eq => eq.name === option.name)
    
    if (isSelected) {
      // Remove it
      onEquipmentChange(selectedEquipment.filter(eq => eq.name !== option.name))
    } else {
      // Add it
      onEquipmentChange([...selectedEquipment, { name: option.name, cost: option.cost }])
    }
  }

  const handleSelectRadio = (group, option) => {
    // Check if this option is already selected
    const isAlreadySelected = isOptionSelected(option.name)
    
    if (isAlreadySelected) {
      // Deselect it (remove from selected equipment)
      onEquipmentChange(selectedEquipment.filter(eq => eq.name !== option.name))
    } else {
      // Remove any previously selected option from this group
      const otherGroupSelections = selectedEquipment.filter(eq => 
        !group.options.some(opt => opt.name === eq.name)
      )
      
      // Add the new selection
      onEquipmentChange([...otherGroupSelections, { name: option.name, cost: option.cost }])
    }
  }

  const isOptionSelected = (optionName) => {
    return selectedEquipment.some(eq => eq.name === optionName)
  }

  return (
    <div className="space-y-6">
      {optionGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="pb-4">
          <h4 className="mb-3">{group.label}</h4>
          
          <div className="space-y-2">
            {group.options.map((option, optionIndex) => (
              <EquipmentOption
                key={optionIndex}
                option={option}
                group={group}
                isOptionSelected={isOptionSelected}
                handleSelectRadio={handleSelectRadio}
                handleToggleCheckbox={handleToggleCheckbox}
                weaponListMetadata={weaponListMetadata}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EquipmentOption({ option, group, isOptionSelected, handleSelectRadio, handleToggleCheckbox, weaponListMetadata }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check if this option has weapon list metadata (meaning it was expanded from a list)
  const listMetadata = weaponListMetadata[option.name]
  const isWeaponList = !!listMetadata
  
  if (isWeaponList) {
    // This is a weapon list - show accordion
    return (
      <div className="border border-accent rounded-lg">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 p-3 hover:bg-surface transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform text-accent ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="flex-1 text-left font-semibold text-accent">
            {listMetadata.listName}
          </span>
          <span className="text-sm text-secondary">
            {listMetadata.itemCount} {listMetadata.itemCount === 1 ? 'item' : 'items'}
          </span>
        </button>
        
        {/* Accordion Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="p-3 pt-0 pl-8 space-y-2">
            {listMetadata.items.map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOptionSelected(item.name)}
                  onChange={() => 
                    group.type === 'radio'
                      ? handleSelectRadio(group, item)
                      : handleToggleCheckbox(item)
                  }
                  className="w-4 h-4"
                />
                <span className="flex-1">{item.name}</span>
                <span className="text-secondary">
                  {item.cost > 0 ? `+${item.cost} pts` : 'Free'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Regular option - show as before
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isOptionSelected(option.name)}
        onChange={() => 
          group.type === 'radio'
            ? handleSelectRadio(group, option)
            : handleToggleCheckbox(option)
        }
        className="w-4 h-4"
      />
      <span className="flex-1">{option.name}</span>
      <span className="text-secondary">
        {option.cost > 0 ? `+${option.cost} pts` : 'Free'}
      </span>
    </label>
  )
}