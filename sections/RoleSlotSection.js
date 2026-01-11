'use client'

import RoleSlotCard from '@/components/RoleSlotCard'

export default function RoleSlotSection({ roleSlot, detachment, template, list, onUpdate, onShowSnackbar, onRemoveLogisticalRole, onChangeLogisticalRole }) {
  const { role, quantity, primeSlots, triggeredBy } = roleSlot

  const unitsInRole = detachment.units.filter(u => u.role === role)

  // Calculate slot index offset for logistical benefit roles
  let slotIndexOffset = 0
  if (triggeredBy && template) {
    // This is an added role - find how many template slots exist for this role
    const templateRoleSlot = template.role_slots?.find(r => r.role === role)
    if (templateRoleSlot) {
      slotIndexOffset = templateRoleSlot.quantity
    }
  }

  const slots = []
  for (let i = 0; i < quantity; i++) {
    const slotNumber = i + 1
    const actualSlotIndex = slotIndexOffset + i
    const isPrime = primeSlots.includes(slotNumber)
    const unit = unitsInRole.find(u => u.slotIndex === actualSlotIndex)
    
    slots.push({
      slotNumber,
      slotIndex: actualSlotIndex,
      isPrime,
      unit,
      isLogisticalBenefit: !!triggeredBy // This slot is from a Logistical Benefit
    })
  }

  return (
    <div className="mb-10">
      {/* Role Header */}
      <div className="flex items-center justify-between gap-2 mb-8">

        <div className="flex items-center gap-2">
          <h4>
            {roleSlot.triggeredBy && (
              <div className="text-accent inline">Logistical Benefit: </div>
            )}
            {role}
          </h4>
          <p>({quantity})</p>
        </div>

        <div>
          {roleSlot.triggeredBy && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Trigger the change modal by setting state in parent
                onChangeLogisticalRole({ 
                  detachmentId: detachment.id, 
                  roleSlot: roleSlot,
                  triggeredBy: roleSlot.triggeredBy 
                })
              }}
              className="btn btn-secondary"
            >
              Swap
            </button>
            <button
              onClick={() => onRemoveLogisticalRole(roleSlot)}
              className="btn btn-danger"
            >
              Remove
            </button>
          </div>
        )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {slots.map(slot => (
          <RoleSlotCard
            key={slot.slotIndex}
            slot={slot}
            role={role}
            detachment={detachment}
            list={list}
            onUpdate={onUpdate}
            onShowSnackbar={onShowSnackbar}
            onRemoveLogisticalRole={onRemoveLogisticalRole}
            onChangeLogisticalRole={onChangeLogisticalRole} 
          />
        ))}
      </div>
    </div>
  )
}