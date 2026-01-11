'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'
import DetachmentSelector from '@/components/DetachmentSelector'
import RoleSlotSection from '@/sections/RoleSlotSection'
import RoleSelector from '@/components/RoleSelector'


export default function DetachmentCard({ detachment, template, list, onUpdate, onShowSnackbar, availableDetachments, onAddDetachment, onRemoveDetachment, onAddLogisticalRole, onRemoveLogisticalRole, onTriggerChangeLogisticalRole, onChangeLogisticalRole, changeRoleTrigger }) {
 
  const [showDetachmentSelector, setShowDetachmentSelector] = useState(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getLogisticalBenefitUnits = () => {
    return detachment.units.filter(u => 
      u.primeBenefit && u.primeBenefit.id === 'logistical-benefit'
    )
  }

  const logisticalUnits = getLogisticalBenefitUnits()
  const hasUnusedLogisticalBenefits = logisticalUnits.some(u => 
    !detachment.addedRoles.some(role => role.triggeredBy === u.id)
  )

  const [showRoleSelector, setShowRoleSelector] = useState(false)
  const [roleSelectionMode, setRoleSelectionMode] = useState(null)
  const [selectedLogisticalUnit, setSelectedLogisticalUnit] = useState(null)

  useEffect(() => {
    if (changeRoleTrigger && changeRoleTrigger.detachmentId === detachment.id) {
      setSelectedLogisticalUnit({ id: changeRoleTrigger.triggeredBy })
      setRoleSelectionMode('change')
      setShowRoleSelector(true)
    }
  }, [changeRoleTrigger])

  if (!template) {
    return (
      <div className="rounded-lg shadow p-6">
        <p className="text-gray-500">Loading detachment...</p>
      </div>
    )
  }

  const allRoleSlots = [...template.role_slots, ...detachment.addedRoles]

  return (
    <div className="rounded-lg shadow">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-6 flex items-start gap-2 hover:opacity-80 transition-opacity"
      >
        <div className="flex-1 flex justify-between items-start">
          <div className="text-left">
            {!detachment.isValid ? (
              <h3 className="flex text-danger">
                  {detachment.name}
                <span className="items-center align-center justify-center ml-2 px-2 py-0.5 text-xs font-bold uppercase border rounded text-danger border-danger">
                    Warning
                </span>
              </h3>
              ): (
              <h3>{detachment.name}</h3>
            )}
            <div className="flex items-center gap-4">
              <p className="text-secondary">{detachment.type} Detachment</p>
            </div>
            {isCollapsed && (
              <p className="text-xs text-tertiary mt-1">
                {detachment.units.length} {detachment.units.length === 1 ? 'unit' : 'units'}
              </p>
            )}
          </div>
          <div className="text-right">
            <h4>{detachment.totalPoints} pts</h4>
          </div>
        </div>
        {/* Chevron Icon */}
        <svg
          className={`w-5 h-5 text-tertiary transition-transform duration-200 flex-shrink-0 mt-1 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'
        }`}
      >
        <div className="px-6 pb-6">
            {allRoleSlots.map((roleSlot, index) => (
              <RoleSlotSection
                key={index}
                roleSlot={roleSlot}
                detachment={detachment}
                template={template}
                list={list}
                onUpdate={onUpdate}
                onShowSnackbar={onShowSnackbar}
                onRemoveLogisticalRole={onRemoveLogisticalRole}
                onChangeLogisticalRole={onTriggerChangeLogisticalRole}
              />
            ))}
          </div>
          
          {/* Remove Detachment Button (for non-Primary) */}
          {detachment.detachmentId !== 'crusade-primary' && (
            <div className="px-6 pb-6">
              <button
                onClick={() => onRemoveDetachment(detachment)}
                className="btn btn-danger w-full"
              >
                Remove Detachment
              </button>
            </div>
          )}

          {/* Add Detachment Buttons - only show for Crusade Primary */}
          {detachment.detachmentId === 'crusade-primary' && (
            <div className="p-6 border-t space-y-3">
              {availableDetachments.apex > 0 && (
                <button
                  onClick={() => setShowDetachmentSelector('Apex')}
                  className="btn btn-primary btn-lg w-full px-4 py-3"
                >
                  Add Apex Detachment ({availableDetachments.apex} available)
                </button>
              )}
              
              {availableDetachments.auxiliary > 0 && (
                <button
                  onClick={() => setShowDetachmentSelector('Auxiliary')}
                  className="btn btn-primary btn-lg w-full px-4 py-3"
                >
                  Add Auxiliary Detachment ({availableDetachments.auxiliary} available)
                </button>
              )}

              {hasUnusedLogisticalBenefits && (
                <button
                  onClick={() => {
                    setSelectedLogisticalUnit(logisticalUnits[0])
                    setRoleSelectionMode('add')
                    setShowRoleSelector(true)
                  }}
                  className="btn btn-primary btn-lg w-full px-4 py-3"
                >
                  + Add Logistical Benefit Role
                </button>
              )}
            </div>
          )}
      </div>

      {showDetachmentSelector && (
        <Modal
          title={`Select ${showDetachmentSelector} Detachment`}
          onClose={() => setShowDetachmentSelector(null)}
        >
          <DetachmentSelector
            type={showDetachmentSelector}
            list={list}
            onSelect={(detachment) => {
              onAddDetachment(showDetachmentSelector, detachment)
              setShowDetachmentSelector(null)
            }}
          />
        </Modal>
      )}

      {showRoleSelector && selectedLogisticalUnit && (
      <Modal
        title="Add Logistical Benefit Role "
        onClose={() => {
          setShowRoleSelector(false)
          setSelectedLogisticalUnit(null)
        }}
      >
        <RoleSelector
          onSelect={(role) => {
            if (roleSelectionMode === 'add') {
              onAddLogisticalRole(detachment, selectedLogisticalUnit, role)
            } else if (roleSelectionMode === 'change') {
              onChangeLogisticalRole(detachment, changeRoleTrigger.roleSlot, role)
            }
            setShowRoleSelector(false)
            setSelectedLogisticalUnit(null)
            setRoleSelectionMode(null)
          }}
        />
      </Modal>
    )}

    </div>
  )
}