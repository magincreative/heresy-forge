'use client'

import { useState, useEffect } from 'react'
import { useAdminCheck } from '@/lib/useAdminCheck'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import WeaponListFormModal from '@/app/admin/components/WeaponListFormModal'

export default function WeaponListsManagement() {
  const { isAdmin, isLoading } = useAdminCheck()
  const [weaponLists, setWeaponLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWeaponList, setEditingWeaponList] = useState(null)
  const [deletingWeaponList, setDeletingWeaponList] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      fetchWeaponLists()
    }
  }, [isAdmin])

  async function fetchWeaponLists() {
    setLoading(true)
    
    // First get the weapon lists
    const { data: lists, error: listsError } = await supabase
      .from('weapon_lists')
      .select('*')
      .order('name', { ascending: true })

    if (listsError) {
      console.error('Error fetching weapon lists:', listsError)
      setLoading(false)
      return
    }

    // Then get all weapon list items
    const { data: items, error: itemsError } = await supabase
      .from('weapon_list_items')
      .select('*')

    if (itemsError) {
      console.error('Error fetching weapon list items:', itemsError)
    }

    // Combine the data: add items to their respective lists
    const listsWithWeapons = (lists || []).map(list => ({
      ...list,
      weapons: (items || [])
        .filter(item => item.list_id === list.id)
        .map(item => ({
          id: item.id,
          name: item.name,
          cost: item.cost
        }))
    }))

    setWeaponLists(listsWithWeapons)
    setLoading(false)
  }

  // Filter weapon lists based on search
  const filteredWeaponLists = weaponLists.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h2>Weapon Lists Management</h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Create Weapon List
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search weapon lists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-accent rounded bg-background text-white"
        />
      </div>

      {/* Weapon Lists Table */}
      <div className="border-2 border-accent rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent/20">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Weapons Count</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWeaponLists.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-8 text-secondary">
                  {searchTerm 
                    ? 'No weapon lists match your search' 
                    : 'No weapon lists yet. Create your first weapon list!'}
                </td>
              </tr>
            ) : (
              filteredWeaponLists.map(list => (
                <tr key={list.id} className="border-t border-accent/20 hover:bg-accent/5">
                  <td className="p-4 font-semibold">{list.name}</td>
                  <td className="p-4 text-secondary">
                    {list.weapons?.length || 0} weapons
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingWeaponList(list)}
                        className="btn btn-primary btn-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeletingWeaponList(list)}
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
        Showing {filteredWeaponLists.length} of {weaponLists.length} weapon lists
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <WeaponListFormModal
          onSave={handleCreateWeaponList}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingWeaponList && (
        <WeaponListFormModal
          weaponList={editingWeaponList}
          onSave={handleEditWeaponList}
          onClose={() => setEditingWeaponList(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingWeaponList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-danger rounded-lg p-6 max-w-md">
            <h3 className="text-danger mb-4">Delete Weapon List?</h3>
            <p className="text-secondary mb-6">
              Are you sure you want to delete <strong>{deletingWeaponList.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteWeaponList}
                className="flex-1 btn btn-danger"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingWeaponList(null)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  async function handleCreateWeaponList(weaponListData) {
    // First create the weapon list
    const { data: listData, error: listError } = await supabase
      .from('weapon_lists')
      .insert([{ name: weaponListData.name }])
      .select()

    if (listError) {
      console.error('Error creating weapon list:', listError)
      alert('Failed to create weapon list. Check console for details.')
      return
    }

    const newListId = listData[0].id

    // Then create the weapon items
    if (weaponListData.weapons && weaponListData.weapons.length > 0) {
      const weaponItems = weaponListData.weapons.map(weapon => ({
        list_id: newListId,
        name: weapon.name,
        cost: weapon.cost
      }))

      const { error: itemsError } = await supabase
        .from('weapon_list_items')
        .insert(weaponItems)

      if (itemsError) {
        console.error('Error creating weapon items:', itemsError)
        alert('Failed to create weapon items. Check console for details.')
        return
      }
    }

    // Refresh the list
    fetchWeaponLists()
    setShowCreateModal(false)
  }

  async function handleEditWeaponList(weaponListData) {
    // Update the weapon list name
    const { error: listError } = await supabase
      .from('weapon_lists')
      .update({ name: weaponListData.name })
      .eq('id', editingWeaponList.id)

    if (listError) {
      console.error('Error updating weapon list:', listError)
      alert('Failed to update weapon list. Check console for details.')
      return
    }

    // Delete all existing weapon items for this list
    const { error: deleteError } = await supabase
      .from('weapon_list_items')
      .delete()
      .eq('list_id', editingWeaponList.id)

    if (deleteError) {
      console.error('Error deleting old weapon items:', deleteError)
      alert('Failed to update weapons. Check console for details.')
      return
    }

    // Insert new weapon items
    if (weaponListData.weapons && weaponListData.weapons.length > 0) {
      const weaponItems = weaponListData.weapons.map(weapon => ({
        list_id: editingWeaponList.id,
        name: weapon.name,
        cost: weapon.cost
      }))

      const { error: itemsError } = await supabase
        .from('weapon_list_items')
        .insert(weaponItems)

      if (itemsError) {
        console.error('Error creating weapon items:', itemsError)
        alert('Failed to update weapons. Check console for details.')
        return
      }
    }

    // Refresh the list
    fetchWeaponLists()
    setEditingWeaponList(null)
  }

  async function handleDeleteWeaponList() {
    // Delete weapon items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('weapon_list_items')
      .delete()
      .eq('list_id', deletingWeaponList.id)

    if (itemsError) {
      console.error('Error deleting weapon items:', itemsError)
      alert('Failed to delete weapon items. Check console for details.')
      return
    }

    // Then delete the weapon list
    const { error: listError } = await supabase
      .from('weapon_lists')
      .delete()
      .eq('id', deletingWeaponList.id)

    if (listError) {
      console.error('Error deleting weapon list:', listError)
      alert('Failed to delete weapon list. Check console for details.')
    } else {
      setWeaponLists(weaponLists.filter(wl => wl.id !== deletingWeaponList.id))
      setDeletingWeaponList(null)
    }
  }
}