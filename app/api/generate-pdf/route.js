import { NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

export async function POST(request) {
  try {
    const listData = await request.json()
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    })
    
    let yPos = 40
    const leftMargin = 40
    const rightMargin = 572 - 40 // Letter width - margin
    const pageHeight = 792 // Letter height in points
    
    // Helper to check if we need a new page
    const checkNewPage = (neededSpace = 20) => {
      if (yPos + neededSpace > pageHeight - 40) {
        doc.addPage()
        yPos = 40
        return true
      }
      return false
    }
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text(listData.name, leftMargin, yPos)
    yPos += 30
    
    // Army info
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    
    doc.text('Army:', leftMargin, yPos)
    doc.setTextColor(0, 0, 0)
    doc.text(listData.army, leftMargin + 80, yPos)
    yPos += 15
    
    doc.setTextColor(107, 114, 128)
    doc.text('Faction:', leftMargin, yPos)
    doc.setTextColor(0, 0, 0)
    doc.text(listData.faction, leftMargin + 80, yPos)
    yPos += 15
    
    doc.setTextColor(107, 114, 128)
    doc.text('Allegiance:', leftMargin, yPos)
    doc.setTextColor(0, 0, 0)
    doc.text(listData.allegiance, leftMargin + 80, yPos)
    yPos += 15
    
    const pointsText = listData.pointsLimit 
      ? `${listData.totalPoints} / ${listData.pointsLimit} pts`
      : `${listData.totalPoints} pts`
    
    doc.setTextColor(107, 114, 128)
    doc.text('Total Points:', leftMargin, yPos)
    doc.setTextColor(0, 0, 0)
    doc.text(pointsText, leftMargin + 80, yPos)
    yPos += 30
    
    // Process each detachment
    for (const detachment of listData.detachments || []) {
      checkNewPage(30)
      
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(`${detachment.name} (${detachment.totalPoints} pts)`, leftMargin, yPos)
      yPos += 20

      // Horizontal divider under each unit 
      doc.setDrawColor(180, 180, 180) // light grey line 
      doc.setLineWidth(1)
      doc.line(leftMargin, yPos, rightMargin, yPos)
      yPos += 20
      
      if (!detachment.units || detachment.units.length === 0) {
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text('No units', leftMargin, yPos)
        yPos += 20
        continue
      }
      
      // Group units by role
      const unitsByRole = {}
      for (const unit of detachment.units) {
        if (!unitsByRole[unit.role]) {
          unitsByRole[unit.role] = []
        }
        unitsByRole[unit.role].push(unit)
      }
      
      // Sort units within each role: regular units first, then logistical units
      for (const role in unitsByRole) {
        unitsByRole[role].sort((a, b) => {
          // If one is logistical and the other isn't, logistical goes last
          if (a.isLogisticalBenefit && !b.isLogisticalBenefit) return 1
          if (!a.isLogisticalBenefit && b.isLogisticalBenefit) return -1
          // Otherwise maintain original order
          return 0
        })
      }
      
      // Display each role
      for (const [role, units] of Object.entries(unitsByRole)) {
        checkNewPage(30)
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(role.toUpperCase(), leftMargin, yPos)
        yPos += 18
        
        // Display each unit
        for (const unit of units) {
          checkNewPage(40)
          
          // Check if this is a Logistical Benefit unit (marked on the unit itself)
          const isLogisticalUnit = unit.isLogisticalBenefit === true
          
          // Unit name with Logistical badge
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 0, 0)
          
          let displayName = unit.name
          
          if (unit.isLogisticalBenefit) { displayName += " [LOGISTICAL BENEFIT]" }
          
          doc.text(displayName, leftMargin, yPos)
          
          // Points (right-aligned)
          const pointsText = `${unit.totalCost} pts`
          const pointsWidth = doc.getTextWidth(pointsText)
          doc.text(pointsText, rightMargin - pointsWidth, yPos)
          yPos += 15
          
          // Special Rules
          if (unit.specialRules && unit.specialRules.length > 0) {
            checkNewPage(15)

            // Heading
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 0, 0)
            doc.text('Special Rules:', leftMargin, yPos)
            yPos += 12

            // Body text
            doc.setFont('helvetica', 'normal')
            const rulesText = unit.specialRules.join(', ')
            const rulesLines = doc.splitTextToSize(
              rulesText,
              rightMargin - leftMargin
            )

            doc.text(rulesLines, leftMargin, yPos)
            yPos += rulesLines.length * 12 + 10 // spacing after block
          }

          
          // Wargear (equipment OR base wargear)
          const wargearList = []
          if (unit.equipment && unit.equipment.length > 0) {
            wargearList.push(...unit.equipment.map(eq => eq.name))
          } else if (unit.baseWargear && unit.baseWargear.length > 0) {
            wargearList.push(...unit.baseWargear)
          }
          
          if (wargearList.length > 0) {
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('Wargear: ', leftMargin, yPos)
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')
            const rulesText = unit.specialRules.join(', ')
            const rulesLines = doc.splitTextToSize(rulesText, rightMargin - leftMargin - 100)
            yPos += 12

            for (const wg of wargearList) {
              checkNewPage(15)
              doc.text(`• ${wg}`, leftMargin + 10, yPos)
              yPos += 12
            }
            yPos += 10
          }

          // Prime Benefit
          if (unit.primeBenefit) {
            checkNewPage(15)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(0, 156, 255)
            doc.text(`Prime: ${unit.primeBenefit.name}`, leftMargin, yPos)
            yPos += 12
            
            if (unit.primeBenefit.description) {
              checkNewPage(20)
              doc.setFont('helvetica', 'italic')
              doc.setTextColor(102, 102, 102)
              const descLines = doc.splitTextToSize(unit.primeBenefit.description, rightMargin - leftMargin - 20)
              doc.text(descLines, leftMargin, yPos)
              yPos += (descLines.length * 12)
            }
            yPos += 10
          }

          // Horizontal divider under each unit 
          doc.setDrawColor(180, 180, 180) // light grey line 
          doc.setLineWidth(1)
          doc.line(leftMargin, yPos, rightMargin, yPos)
          yPos += 20 
        }
        yPos += 20
      }
      
      yPos += 15
    }
    
    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="HeresyForge-${listData.name}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
