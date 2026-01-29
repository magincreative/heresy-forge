'use client'

export default function InvalidUnitsWarning({ invalidUnits, onRemoveUnits, onCancel }) {
  if (!invalidUnits || invalidUnits.length === 0) return null

  return (
    <div className="border-2 border-danger rounded-lg p-6 mb-6 bg-danger/10">
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h4 className="text-danger mb-2">Invalid Units Detected</h4>
          <p className="text-white mb-4">
            The following units are no longer compatible with your list settings and must be removed:
          </p>
          
          <ul className="space-y-2 mb-4">
            {invalidUnits.map((unit, index) => (
              <li key={index} className="text-white">
                <span className="font-semibold">{unit.unitName}</span>
                <span className="text-secondary"> (in {unit.detachmentName})</span>
              </li>
            ))}
          </ul>
          
          <div className="flex gap-4">
            <button
              onClick={onRemoveUnits}
              className="btn btn-danger"
            >
              Remove Invalid Units & Save
            </button>
            <button
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
