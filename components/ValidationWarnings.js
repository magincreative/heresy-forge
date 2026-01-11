'use client'

export default function ValidationWarnings({ warnings }) {
  if (!warnings || warnings.length === 0) {
    return null
  }

  // Validation {warnings.length === 1 ? 'Issue:' : 'Issues:'} {warnings.length}

  return (
    <div className="text-danger border-2 border-red-500 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-danger mb-2">
            Warning //
          </h3>
          <div className="space-y-3">
            {warnings.map((warning, index) => (
              <div key={index} className="rounded">
                <h4 className="text-danger mb-1">{warning.detachmentName}</h4>
                <p className="mb-2">{warning.message}</p>
                <h4 className="text-danger mb-1">Fix</h4>
                <p>{warning.fix}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

