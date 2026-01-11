'use client'

export default function PrimeBenefitSelector({ benefits, selectedBenefit, onBenefitChange, isPrimeSlot, detachment, currentUnitId }) {
  if (!isPrimeSlot) {
    return null
  }

  // Check if Logistical Benefit is already used by another unit in this detachment
  const isLogisticalBenefitUsed = detachment?.units?.some(u => 
    u.id !== currentUnitId && 
    u.primeBenefit?.id === 'logistical-benefit'
  )

  return (
    <div className="border-t pt-6 mb-6">
      <h5 className="mb-4">Prime Slot Benefit (Optional)</h5>
      
      {/* Benefit Options */}
      <div className="grid md:grid-cols-2 gap-3">
        {benefits.map(benefit => {
          const isDisabled = benefit.id === 'logistical-benefit' && isLogisticalBenefitUsed
          const isSelected = selectedBenefit?.id === benefit.id
          
          return (
            <button
              key={benefit.id}
              type="button"
              onClick={() => !isDisabled && onBenefitChange(benefit)}
              disabled={isDisabled}
              className={`btn btn-lg ${
                isSelected ? 'btn-primary' : 'btn-secondary'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {benefit.name}
              {isDisabled && ' (Already used)'}
            </button>
          )
        })}
        
        {/* No Benefit Option - Last in grid */}
        <button
          type="button"
          onClick={() => onBenefitChange(null)}
          className={`btn btn-lg ${
            !selectedBenefit ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          No Benefit
        </button>
      </div>

      {/* Description */}
      {selectedBenefit && (
        <div className="mt-4 p-4 bg-surface border border-accent rounded-lg">
          <h5 className="mb-2">{selectedBenefit.name}</h5>
          <p>{selectedBenefit.description}</p>
        </div>
      )}
    </div>
  )
}