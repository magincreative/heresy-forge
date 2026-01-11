'use client'

import { useState } from 'react'

export default function ArmySummary({ list }) {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!list) return null

  const handleExportPDF = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'PDF generation failed')
      }
      
      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${list.name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF export error:', error)
      alert(`Failed to generate PDF: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const totalUnits = list.detachments.reduce((sum, det) => sum + det.units.length, 0)

  return (
    <div className="card p-6 mb-6">
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold tracking-wider">ARMY SUMMARY</h3>
        <button
          onClick={handleExportPDF}
          disabled={isGenerating}
          className="btn btn-primary"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              EXPORT PDF
            </>
          )}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="border border-white p-3">
          <p className="text-base font-semibold tracking-wide mb-1">Total Points</p>
          <p className="text-base font-normal">
            {list.totalPoints}
            {list.pointsLimit && <span className="text-secondary">/{list.pointsLimit}</span>}pts
          </p>
        </div>
        <div className="border border-white p-3">
          <p className="text-base font-semibold tracking-wide mb-1">Total Units</p>
          <p className="text-base font-normal">{totalUnits}</p>
        </div>
        <div className="border border-white p-3">
          <p className="text-base font-semibold tracking-wide mb-1">Total Detachments</p>
          <p className="text-base font-normal">{list.detachments.length}</p>
        </div>
      </div>

      {/* Detachments with Units */}
      <div className="space-y-6">
        {list.detachments.map(detachment => {
          if (!detachment.units || detachment.units.length === 0) return null

          // Group units by role
          const unitsByRole = {}
          detachment.units.forEach(unit => {
            if (!unitsByRole[unit.role]) {
              unitsByRole[unit.role] = []
            }
            unitsByRole[unit.role].push(unit)
          })

          // Sort units within each role: regular units first, then logistical units
          Object.keys(unitsByRole).forEach(role => {
            unitsByRole[role].sort((a, b) => {
              // If one is logistical and the other isn't, logistical goes last
              if (a.isLogisticalBenefit && !b.isLogisticalBenefit) return 1
              if (!a.isLogisticalBenefit && b.isLogisticalBenefit) return -1
              // Otherwise maintain original order
              return 0
            })
          })

          return (
            <div key={detachment.id}>
              <h4 className="text-base font-semibold tracking-wide mb-4">
                DETACHMENT: {detachment.name}
              </h4>
              
              <div className="space-y-4">
                {Object.entries(unitsByRole).map(([role, units]) => (
                  <div key={role} className="space-y-2">
                    <p className="text-base font-semibold tracking-wide text-white">
                      {role.toUpperCase()}
                    </p>
                    
                    {units.map((unit, idx) => {
                      // Check if this unit is marked as a Logistical Benefit unit
                      const isLogisticalUnit = unit.isLogisticalBenefit === true
                      
                      return (
                      <div key={idx} className="space-y-1">
                        {/* Unit name and points */}
                        <div className="flex items-end justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tracking-wide">{unit.name}</span>
                          </div>
                          <div className="flex-1 mx-3 border-b border-dotted border-secondary mb-1"></div>
                          <span className="text-sm font-semibold tracking-wide text-right min-w-[60px]">
                            {unit.totalCost}pts
                          </span>
                        </div>
                        {isLogisticalUnit && (
                          <span className="text-xs text-accent font-bold uppercase border border-accent px-1 rounded">
                            Logistical
                          </span>
                        )}
                        
                        {/* Prime Benefit */}
                        {unit.primeBenefit && (
                          <p className="text-xs text-accent ml-2 mt-1">
                            Prime: {unit.primeBenefit.name}
                          </p>
                        )}
                        
                        {/* Equipment list OR base wargear */}
                        {unit.equipment && unit.equipment.length > 0 ? (
                          <ul className="text-sm text-white ml-5 list-disc">
                            {unit.equipment.map((eq, eqIdx) => (
                              <li key={eqIdx}>{eq.name}</li>
                            ))}
                          </ul>
                        ) : unit.baseWargear && unit.baseWargear.length > 0 ? (
                          <ul className="text-sm text-white ml-5 list-disc">
                            {unit.baseWargear.map((wg, wgIdx) => (
                              <li key={wgIdx}>{wg}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    )})}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
