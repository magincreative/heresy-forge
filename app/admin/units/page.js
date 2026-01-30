'use client'

import { useState, useEffect } from 'react'
import { useAdminCheck } from '@/lib/useAdminCheck'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import UnitFormModal from '@/app/admin/components/UnitFormModal'
import EquipmentOptionsModal from '@/app/admin/components/EquipmentOptionsModal'

export default function UnitsManagement() {
  const { isAdmin, isLoading } = useAdminCheck()
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [deletingUnit, setDeletingUnit] = useState(null)
  const [editingEquipment, setEditingEquipment] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      fetchUnits()
    }
  }, [isAdmin])

  async function fetchUnits() {
    setLoading(true)
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching units:', error)
    } else {
      setUnits(data || [])
    }
    setLoading(false)
  }

  // Filter units based on search and role
  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'All' || unit.role === filterRole
    return matchesSearch && matchesRole
  })

  const roles = ['All', 'High Command', 'Command', 'Troops', 'Elites', 'Fast Attack', 'Heavy Support', 'Lord of War']

  if (isLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-secondary">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/admin" className="text-accent hover:opacity-80 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h2>Units Management</h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Unit
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search units..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-accent rounded bg-background text-white"
        />
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full px-4 py-2 border border-accent rounded bg-background text-white"
        >
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Units Table */}
      <div className="border-2 border-primary rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent/20">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Army</th>
              <th className="text-left p-4">Cost</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-secondary">
                  {searchTerm || filterRole !== 'All' 
                    ? 'No units match your search' 
                    : 'No units yet. Create your first unit!'}
                </td>
              </tr>
            ) : (
              filteredUnits.map(unit => (
                <tr key={unit.id} className="border-t border-accent/20 hover:bg-accent/5">
                  <td className="p-4 font-semibold">{unit.name}</td>
                  <td className="p-4 text-secondary">{unit.role}</td>
                  <td className="p-4 text-secondary">{unit.army}</td>
                  <td className="p-4 text-secondary">{unit.base_cost} pts</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingEquipment(unit)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Equipment Options"
                      >
                        Equipment
                      </button>
                      <button 
                        onClick={() => setEditingUnit(unit)}
                        className="btn btn-primary btn-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeletingUnit(unit)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 text-secondary text-sm">
        Showing {filteredUnits.length} of {units.length} units
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <UnitFormModal
          onSave={handleCreateUnit}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingUnit && (
        <UnitFormModal
          unit={editingUnit}
          onSave={handleEditUnit}
          onClose={() => setEditingUnit(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-danger rounded-lg p-6 max-w-md">
            <h3 className="text-danger mb-4">Delete Unit?</h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete <strong>{deletingUnit.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteUnit}
                className="flex-1 btn btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingUnit(null)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Options Modal */}
      {editingEquipment && (
        <EquipmentOptionsModal
          unit={editingEquipment}
          onSave={handleSaveEquipment}
          onClose={() => setEditingEquipment(null)}
        />
      )}
    </div>
  )

  async function handleCreateUnit(unitData) {
    const { data, error } = await supabase
      .from('units')
      .insert([unitData])
      .select()

    if (error) {
      console.error('Error creating unit:', error)
      alert('Failed to create unit. Check console for details.')
    } else {
      setUnits([...units, data[0]])
      setShowCreateModal(false)
    }
  }

  async function handleEditUnit(unitData) {
    const { data, error } = await supabase
      .from('units')
      .update(unitData)
      .eq('id', editingUnit.id)
      .select()

    if (error) {
      console.error('Error updating unit:', error)
      alert('Failed to update unit. Check console for details.')
      return
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update')
      alert('Update may have failed - no data returned. Check console.')
      return
    }

    setUnits(units.map(u => u.id === editingUnit.id ? data[0] : u))
    setEditingUnit(null)
  }

  async function handleDeleteUnit() {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', deletingUnit.id)

    if (error) {
      console.error('Error deleting unit:', error)
      alert('Failed to delete unit. Check console for details.')
    } else {
      setUnits(units.filter(u => u.id !== deletingUnit.id))
      setDeletingUnit(null)
    }
  }

  async function handleSaveEquipment(equipmentData) {
    const { data, error } = await supabase
      .from('units')
      .update(equipmentData)
      .eq('id', editingEquipment.id)
      .select()

    if (error) {
      console.error('Error updating equipment:', error)
      alert('Failed to update equipment. Check console for details.')
      return
    }

    if (!data || data.length === 0) {
      console.error('No data returned from update')
      alert('Update may have failed. Check console.')
      return
    }

    setUnits(units.map(u => u.id === editingEquipment.id ? data[0] : u))
    setEditingEquipment(null)
  }
}