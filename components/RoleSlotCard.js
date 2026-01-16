'use client'

import { useState } from 'react'
import Link from 'next/link'
import Modal from '@/components/Modal'
import UnitSelector from '@/components/UnitSelector'

export default function RoleSlotCard({ slot, role, detachment, list, onUpdate, onShowSnackbar }) {
  const [showUnitSelector, setShowUnitSelector] = useState(false)

  const updateDetachmentUnits = (newUnits) => {
    const updatedDetachment = {
      ...detachment,
      units: newUnits
    }

    updatedDetachment.totalPoints = updatedDetachment.units.reduce(
      (sum, u) => sum + u.totalCost,
      0
    )

    const updatedList = {
      ...list,
      detachments: list.detachments.map(d =>
        d.id === detachment.id ? updatedDetachment : d
      )
    }

    updatedList.totalPoints = updatedList.detachments.reduce(
      (sum, d) => sum + d.totalPoints,
      0
    )

    onUpdate(updatedList)
  }

  const handleAddUnit = () => {
    setShowUnitSelector(true)
  }

  const handleSelectUnit = (unitData) => {
    const newUnit = {
      id: `unit-${Date.now()}`,
      slotIndex: slot.slotIndex,
      unitId: unitData.id,
      name: unitData.name,
      role: unitData.role,
      isPrimeSlot: slot.isPrime,
      baseCost: unitData.base_cost,
      equipmentCost: 0,
      totalCost: unitData.base_cost,
      equipment: [],
      baseWargear: unitData.base_wargear || [], // Include base wargear
      specialRules: unitData.special_rules || [], // Include special rules
      primeBenefit: null,
      isLogisticalBenefit: slot.isLogisticalBenefit || false // Mark if from Logistical Benefit
    }

    const newUnits = [...detachment.units, newUnit]
    updateDetachmentUnits(newUnits)

    setShowUnitSelector(false)
  }

  const handleRemoveUnit = () => {
    const removedUnit = slot.unit
    
    const newUnits = detachment.units.filter(u => u.id !== slot.unit.id)
    updateDetachmentUnits(newUnits)
    onShowSnackbar({
      message: `${removedUnit.name} removed`,
      onUndo: () => handleUndoRemove(removedUnit)
    })
  }

  const handleUndoRemove = (unitToRestore) => {
    const newUnits = [...detachment.units, unitToRestore]
    updateDetachmentUnits(newUnits)
  }

  if (!slot.unit) {
    return (
      <>
        <div className="border-2 border-default rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4>
                Slot {slot.slotNumber}
              </h4>

              {slot.isPrime && 
                <h5 className="text-accent">
                  Prime
                </h5>
              }
            </div>
            <button
              onClick={handleAddUnit}
              className="btn btn-secondary"
            >
              + Add Unit
            </button>
          </div>
        </div>

        {showUnitSelector && (
          <Modal 
            title={`Select ${role} Unit`}
            onClose={() => setShowUnitSelector(false)}
          >
            <UnitSelector
              role={role}
              list={list}
              onSelect={handleSelectUnit}
            />
          </Modal>
        )}
      </>
    )
  }

  const unit = slot.unit
  return (
    <div className="border-2 border-accent rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4>
            {unit.name}
          </h4>
          
          {slot.isPrime && 
            <h5 className="text-accent">
              Prime
              {unit.primeBenefit && (
                <span>: {unit.primeBenefit.name}</span>
              )}
            </h5>
          }

        </div>
        <div className="text-right">
          <h4>{unit.totalCost} pts</h4>
          {/*{unit.equipmentCost > 0 && (
            <p className="text-tertiary">({unit.baseCost}pts + {unit.equipmentCost}pts)</p>
          )}*/}
        </div>
      </div>

      {/* Wargear and Special Rules in two columns */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        {/* Wargear Column */}
        <div>
          {(unit.equipment && unit.equipment.length > 0) || (unit.baseWargear && unit.baseWargear.length > 0) ? (
            <>
              <h5 className="text-sm font-semibold mb-1">Wargear</h5>
              {unit.equipment && unit.equipment.length > 0 ? (
                <ul className="text-tertiary text-sm ml-2 list-disc list-inside">
                  {unit.equipment.map((eq, i) => (
                    <li key={i}>{eq.name} {eq.cost > 0 && `(+${eq.cost} pts)`}</li>
                  ))}
                </ul>
              ) : unit.baseWargear && unit.baseWargear.length > 0 ? (
                <ul className="text-tertiary text-sm ml-2 list-disc list-inside">
                  {unit.baseWargear.map((wg, i) => (
                    <li key={i}>{wg}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </div>

        {/* Special Rules Column */}
        <div>
          {unit.specialRules && unit.specialRules.length > 0 && (
            <>
              <h5 className="text-sm font-semibold mb-1">Special Rules</h5>
              <ul className="text-tertiary text-sm ml-2 list-disc list-inside">
                {unit.specialRules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-3 pt-3">
        <Link 
          href={`/list/${list.id}/edit-unit/${unit.id}`}
          className="btn btn-primary"
        >
          Edit
        </Link>
        <button
          onClick={handleRemoveUnit}
          className="btn btn-danger"
        >
          Remove
        </button>
      </div>
    </div>
  )
}