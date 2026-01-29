'use client'

import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Snackbar from '@/components/Snackbar'
import RoleSlotCard from '@/components/RoleSlotCard'
import RoleSlotSection from '@/sections/RoleSlotSection'
import DetachmentCard from '@/components/DetachmentCard'
import ValidationWarnings from '@/components/ValidationWarnings'
import ArmySummary from '@/components/ArmySummary'
import Modal from '@/components/Modal';
import ListSettingsModal from '@/components/ListSettingsModal'
import { useAuth } from '@/contexts/AuthContext'
import { saveListToCloud, saveLocalLists, getLocalLists } from '@/lib/listSyncUtils'
import InvalidUnitsWarning from '@/components/InvalidUnitsWarning'


export default function ArmyListPage() {
  const params = useParams()
  const { user } = useAuth()
  const [list, setList] = useState(null)
  const [detachmentTemplates, setDetachmentTemplates] = useState({})
  const [snackbar, setSnackbar] = useState(null)
  const [availableDetachments, setAvailableDetachments] = useState({ apex: 0, auxiliary: 0 })
  const [changeLogisticalRoleData, setChangeLogisticalRoleData] = useState(null)
  const [changeRoleTrigger, setChangeRoleTrigger] = useState(null)
  const [showListSettings, setShowListSettings] = useState(false)
  const [invalidUnits, setInvalidUnits] = useState([])
  const [pendingListUpdate, setPendingListUpdate] = useState(null)


  // Loads datas when the page opens
  useEffect(() => {
    loadData()
  }, [params.id])

  // Calculates available detachments
  useEffect(() => {
    if (list) {
      const available = getAvailableDetachments()
      setAvailableDetachments(available)
    }
  }, [list])

  const loadData = async () => {
    console.log('🔍 Loading list with ID:', params.id)
    
    // Load list from localStorage
    const lists = getLocalLists()
    console.log('📦 Total lists in localStorage:', lists.length)
    console.log('📋 List IDs in storage:', lists.map(l => l.id))
    
    const foundList = lists.find(l => {
      // Try to match with or without 'list-' prefix
      const cleanListId = l.id.replace('list-', '')
      const cleanParamId = params.id.replace('list-', '')
      return cleanListId === cleanParamId
    })
    console.log('🎯 Found list:', foundList ? foundList.name : 'NOT FOUND')

    if (foundList) {
      setList(foundList)
      
      // Get all detachment IDs from this list
      const detachmentIds = foundList.detachments.map(d => d.detachmentId)
      console.log('🏛️ Detachment IDs:', detachmentIds)
      
      if (detachmentIds.length > 0) {
        // Fetch matching detachment templates from Supabase
        console.log('📡 Querying Supabase for detachment IDs:', detachmentIds)
        const { data: templates, error } = await supabase
          .from('detachments')
          .select('*')
          .in('id', detachmentIds)
        
        console.log('📥 Supabase response - data:', templates, 'error:', error)
        
        if (error) {
          console.error('❌ Error loading detachment templates:', error)
        } else {
          console.log('✅ Loaded templates:', templates?.length || 0)
        }
        
        // Convert array to object for easy lookup
        const templatesObj = {}
        if (templates) {
          templates.forEach(t => {
            templatesObj[t.id] = t
          })
        }

        setDetachmentTemplates(templatesObj)
      }
    } else {
      console.error('❌ List not found with ID:', params.id)
    }
  }

  const saveList = async (updatedList) => {
    // Update the list in our component state
    setList(updatedList)
    
    // Add timestamp
    updatedList.updatedAt = new Date().toISOString()
    
    if (user) {
      // Logged in - save to cloud
      const result = await saveListToCloud(updatedList, user.id)
      if (!result.success) {
        console.error('Failed to save to cloud:', result.error)
      }
    }
    
    // Always save to localStorage (backup for logged in, primary for guests)
    const lists = getLocalLists()
    const index = lists.findIndex(l => l.id === updatedList.id || `list-${l.id}` === updatedList.id)
    if (index !== -1) {
      lists[index] = updatedList
    } else {
      lists.push(updatedList)
    }
    saveLocalLists(lists)
  }

  if (!list) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const getAvailableDetachments = () => {
    const crusadePrimary = list.detachments.find(d => d.detachmentId === 'crusade-primary')
    if (!crusadePrimary) return { apex: 0, auxiliary: 0 }

    // Count High Command units (each unlocks 1 Apex)
    const highCommandCount = crusadePrimary.units.filter(u => u.role === 'High Command').length

    // Count Command units (each unlocks 1 Auxiliary)
    const commandCount = crusadePrimary.units.filter(u => u.role === 'Command').length

    // Count how many of each type are already added
    const apexAdded = list.detachments.filter(d => d.type === 'Apex').length
    const auxiliaryAdded = list.detachments.filter(d => d.type === 'Auxiliary').length

    return {
      apex: Math.max(0, highCommandCount - apexAdded),
      auxiliary: Math.max(0, commandCount - auxiliaryAdded)
    }
  }

  const handleAddDetachment = (type, detachmentTemplate) => {
    // Find a triggering unit (High Command for Apex, Command for Auxiliary)
    const crusadePrimary = list.detachments.find(d => d.detachmentId === 'crusade-primary')
    const triggeringRole = type === 'Apex' ? 'High Command' : 'Command'
    const triggeringUnit = crusadePrimary.units.find(u => u.role === triggeringRole)

    // Create new detachment
    const newDetachment = {
      id: `det-${crypto.randomUUID()}`,
      detachmentId: detachmentTemplate.id,
      name: detachmentTemplate.name,
      type: detachmentTemplate.type,
      isValid: true,
      totalPoints: 0,
      triggeredBy: triggeringUnit ? triggeringUnit.id : null,
      units: [],
      addedRoles: []
    }

    // Add to list
    const updatedList = {
      ...list,
      detachments: [...list.detachments, newDetachment]
    }

    saveList(updatedList)
    loadData()
  }

  const handleRemoveDetachment = (detachmentToRemove) => {
    // Remove the detachment
    const updatedList = {
      ...list,
      detachments: list.detachments.filter(d => d.id !== detachmentToRemove.id)
    }

    // Recalculate total points
    updatedList.totalPoints = updatedList.detachments.reduce(
      (sum, d) => sum + d.totalPoints,
      0
    )

    saveList(updatedList)

    // Show snackbar with undo
    setSnackbar({
      message: `${detachmentToRemove.name} removed`,
      onUndo: () => {
        const restoredList = {
          ...list,
          detachments: [...list.detachments, detachmentToRemove]
        }
        restoredList.totalPoints = restoredList.detachments.reduce(
          (sum, d) => sum + d.totalPoints,
          0
        )
        saveList(restoredList)
      }
    })
  }

  const handleAddLogisticalRole = (detachment, triggeringUnit, role) => {
    // Add new role to detachment's addedRoles
    const newRole = {
      role: role,
      quantity: 1,
      primeSlots: [],
      triggeredBy: triggeringUnit.id
    }

    const updatedDetachment = {
      ...detachment,
      addedRoles: [...detachment.addedRoles, newRole]
    }

    const updatedList = {
      ...list,
      detachments: list.detachments.map(d =>
        d.id === detachment.id ? updatedDetachment : d
      )
    }

    saveList(updatedList)
  }

  const handleRemoveLogisticalRole = (roleSlot) => {
    // Find which detachment contains this role
    const detachment = list.detachments.find(d =>
      d.addedRoles.some(r => r.role === roleSlot.role && r.triggeredBy === roleSlot.triggeredBy)
    )

    if (!detachment) return

    // Remove the role
    const updatedDetachment = {
      ...detachment,
      addedRoles: detachment.addedRoles.filter(r =>
        !(r.role === roleSlot.role && r.triggeredBy === roleSlot.triggeredBy)
      ),
      // Also remove any units in that role
      units: detachment.units.filter(u => u.role !== roleSlot.role || u.slotIndex < roleSlot.quantity - 1)
    }

    const updatedList = {
      ...list,
      detachments: list.detachments.map(d =>
        d.id === detachment.id ? updatedDetachment : d
      )
    }

    saveList(updatedList)
  }

  const handleTriggerChangeLogisticalRole = (triggerData) => {
    setChangeRoleTrigger(triggerData)
  }

  const handleChangeLogisticalRole = (detachment, roleSlot, newRole) => {
    // Stores the original Role and Detachment in event that the Role is changed 
    const oldRole = roleSlot.role
    const oldDetachment = { ...detachment }

    // Find and update the role in addedRoles
    const updatedDetachment = {
      ...detachment,
      addedRoles: (detachment.addedRoles || []).map(r =>
        r.role === roleSlot.role && r.triggeredBy === roleSlot.triggeredBy
          ? { ...r, role: newRole }
          : r
      ),
      // Remove units that were in the old role (since role changed)
      units: (detachment.units || []).filter(u => u.role !== oldRole)
    }

    // Recalculate detachment points
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

    // Recalculate total points
    updatedList.totalPoints = updatedList.detachments.reduce(
      (sum, d) => sum + d.totalPoints,
      0
    )

    saveList(updatedList)
    setChangeRoleTrigger(null)
    loadData()

    // Show snackbar with undo
    setSnackbar({
      message: `Logistical role changed from ${oldRole} to ${newRole}`,
      onUndo: () => {
        const restoredList = {
          ...list,
          detachments: list.detachments.map(d =>
            d.id === detachment.id ? oldDetachment : d
          )
        }
        restoredList.totalPoints = restoredList.detachments.reduce(
          (sum, d) => sum + d.totalPoints,
          0
        )
        saveList(restoredList)
        loadData()
        setSnackbar(null)  // ← Add this line
      }
    })
  }

  const validateDetachments = () => {
    const warnings = []
    
    const detachmentsWithValidity = list.detachments.map(detachment => {
      let isValid = true

      if (detachment.type === 'Apex' || detachment.type === 'Auxiliary') {
        const crusadePrimary = list.detachments.find(d => d.detachmentId === 'crusade-primary')
        const requiredRole = detachment.type === 'Apex' ? 'High Command' : 'Command'

        // Check if ANY unit of the required role exists
        const hasRequiredUnit = crusadePrimary?.units.some(u => u.role === requiredRole)

        if (!hasRequiredUnit) {
          isValid = false
          warnings.push({
            detachmentId: detachment.id,
            detachmentName: detachment.name,
            message: `This ${detachment.type} Detachment requires a ${requiredRole} unit in Crusade Primary Detachment`,
            fix: `Add a ${requiredRole} unit or remove this detachment`
          })
        }
      }

      return { ...detachment, isValid }
    })
    
    return { warnings, detachments: detachmentsWithValidity }
  }

  const handleSaveListSettings = (updatedList) => {
    saveList(updatedList)
    setShowListSettings(false)
    setSnackbar({
      message: 'List settings updated successfully',
      onUndo: null
    })
  }

  const handleRemoveInvalidUnits = () => {
    if (!pendingListUpdate) return
    
    // Create a Set of invalid unit names for faster lookup
    const invalidUnitNames = new Set(invalidUnits.map(u => u.unitName))
    
    // Remove invalid units from all detachments
    const updatedDetachments = pendingListUpdate.detachments.map(detachment => {
      const validUnits = detachment.units.filter(unit => !invalidUnitNames.has(unit.name))
      
      // Recalculate detachment points
      const detachmentPoints = validUnits.reduce((sum, u) => sum + u.totalCost, 0)
      
      return {
        ...detachment,
        units: validUnits,
        totalPoints: detachmentPoints
      }
    })
    
    // Calculate new total points
    const totalPoints = updatedDetachments.reduce((sum, d) => sum + d.totalPoints, 0)
    
    const finalList = {
      ...pendingListUpdate,
      detachments: updatedDetachments,
      totalPoints
    }
    
    saveList(finalList)
    setInvalidUnits([])
    setPendingListUpdate(null)
    setSnackbar({
      message: `List settings updated. ${invalidUnits.length} invalid ${invalidUnits.length === 1 ? 'unit' : 'units'} removed.`,
      onUndo: null
    })
  }

  const handleCancelInvalidUnits = () => {
    setInvalidUnits([])
    setPendingListUpdate(null)
    setSnackbar({
      message: 'List settings change cancelled',
      onUndo: null
    })
  }

  const { warnings: validationWarnings, detachments: updatedDetachments } = validateDetachments()

  return (
    <>
      {/* Header */}
      <header className="mb-6">
        <Link href="/" className="text-accent hover:opacity-80 mb-4 inline-flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-normal">Back to Lists</span>
        </Link>
        <div className="flex justify-between items-start gap-4 sm:flex-row flex-col">
          <div className="flex-1">
            <div className="flex items-start">
              <h2 className="mb-1">{list.name}</h2>
              <button
                onClick={() => setShowListSettings(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Edit list settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 text-secondary">
              <span>{list.army}</span>
              <span>•</span>
              <span>{list.faction}</span>
              <span>•</span>
              <span>{list.allegiance}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
              {!list.pointsLimit && (
                <h4 className="mb-2">
                  {list.totalPoints} pts
                </h4>
              )}
              {list.pointsLimit && (
                <h3 className="mb-2">
                  {list.totalPoints} / {list.pointsLimit} pts
                </h3>
              )}
            <div className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold uppercase border rounded text-accent border-accent">
              Valid
            </div>
          </div>
        </div>
      </header>

      {/* Validation Warnings */}
      <ValidationWarnings warnings={validationWarnings} />
      
      {/* Invalid Units Warning */}
      <InvalidUnitsWarning
        invalidUnits={invalidUnits}
        onRemoveUnits={handleRemoveInvalidUnits}
        onCancel={handleCancelInvalidUnits}
      />

      {/* Detachments */}
        <section className="space-y-6">
          {updatedDetachments.map(detachment => {
            const template = detachmentTemplates[detachment.detachmentId]
            
            return (
              <DetachmentCard
              key={detachment.id}
              detachment={detachment}
              template={template}
              list={list}
              onUpdate={saveList}
              onShowSnackbar={setSnackbar}
              availableDetachments={availableDetachments}
              onAddDetachment={handleAddDetachment}
              onRemoveDetachment={handleRemoveDetachment}
              onAddLogisticalRole={handleAddLogisticalRole}
              onRemoveLogisticalRole={handleRemoveLogisticalRole}
              onTriggerChangeLogisticalRole={handleTriggerChangeLogisticalRole}
              onChangeLogisticalRole={handleChangeLogisticalRole}
              changeRoleTrigger={changeRoleTrigger}
            />
          )
        })}
      </section>

      {/* Army Summary - Moved to bottom */}
      <ArmySummary list={list} />
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          onUndo={snackbar.onUndo}
          onClose={() => setSnackbar(null)}
        />
      )}

      {showListSettings && (
        <ListSettingsModal
          list={list}
          onSave={handleSaveListSettings}
          onClose={() => setShowListSettings(false)}
        />
      )}
    </>
  )
}