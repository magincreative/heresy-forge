import { supabase } from './supabase'

/**
 * Save a list to Supabase (for logged-in users)
 * @param {Object} list - The army list object
 * @param {string} userId - User's ID from auth
 * @returns {Promise<Object>} - { success, data, error }
 */
export async function saveListToCloud(list, userId) {
  try {
    // Remove 'list-' prefix if it exists (localStorage format)
    const cleanId = list.id.replace('list-', '')
    
    const listData = {
      id: cleanId,
      user_id: userId,
      name: list.name,
      army: list.army,
      faction: list.faction,
      allegiance: list.allegiance,
      points_limit: list.pointsLimit || null,
      total_points: list.totalPoints || 0,
      is_valid: list.isValid || true,
      detachments: list.detachments || [],
      updated_at: new Date().toISOString(),
    }

    // Upsert (insert or update if exists)
    const { data, error } = await supabase
      .from('army_lists')
      .upsert(listData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Error saving list to cloud:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Exception saving list:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Load all lists from Supabase for a user
 * @param {string} userId - User's ID from auth
 * @returns {Promise<Object>} - { success, lists, error }
 */
export async function loadListsFromCloud(userId) {
  try {
    const { data, error } = await supabase
      .from('army_lists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error loading lists from cloud:', error)
      return { success: false, lists: [], error: error.message }
    }

    // Transform Supabase format to app format
    const lists = data.map(item => ({
      id: item.id,
      name: item.name,
      army: item.army,
      faction: item.faction,
      allegiance: item.allegiance,
      pointsLimit: item.points_limit,
      totalPoints: item.total_points,
      isValid: item.is_valid,
      detachments: item.detachments,
      lastModified: item.updated_at,
    }))

    return { success: true, lists }
  } catch (err) {
    console.error('Exception loading lists:', err)
    return { success: false, lists: [], error: err.message }
  }
}

/**
 * Delete a list from Supabase
 * @param {string} listId - List ID
 * @param {string} userId - User's ID (for security)
 * @returns {Promise<Object>} - { success, error }
 */
export async function deleteListFromCloud(listId, userId) {
  try {
    const { error } = await supabase
      .from('army_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting list from cloud:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Exception deleting list:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Sync local storage lists to cloud on first login
 * @param {string} userId - User's ID from auth
 * @returns {Promise<Object>} - { success, syncedCount, error }
 */
export async function syncLocalToCloud(userId) {
  try {
    // Get lists from localStorage
    const localLists = JSON.parse(localStorage.getItem('armyLists') || '[]')
    
    if (localLists.length === 0) {
      return { success: true, syncedCount: 0 }
    }

    // Get existing cloud lists to avoid duplicates
    const { lists: cloudLists } = await loadListsFromCloud(userId)
    const cloudListIds = new Set(cloudLists.map(l => l.id))

    // Filter out lists that already exist in cloud
    const listsToSync = localLists.filter(list => !cloudListIds.has(list.id))

    if (listsToSync.length === 0) {
      return { success: true, syncedCount: 0 }
    }

    // Upload each list to cloud
    const results = await Promise.all(
      listsToSync.map(list => saveListToCloud(list, userId))
    )

    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount

    if (failedCount > 0) {
      console.warn(`Synced ${successCount} lists, ${failedCount} failed`)
    }

    return { 
      success: true, 
      syncedCount: successCount,
      failedCount 
    }
  } catch (err) {
    console.error('Exception syncing local to cloud:', err)
    return { success: false, syncedCount: 0, error: err.message }
  }
}

/**
 * Get lists from localStorage (fallback for guests)
 * @returns {Array} - Array of army lists
 */
export function getLocalLists() {
  try {
    return JSON.parse(localStorage.getItem('armyLists') || '[]')
  } catch (err) {
    console.error('Error reading local lists:', err)
    return []
  }
}

/**
 * Save lists to localStorage
 * @param {Array} lists - Array of army lists
 */
export function saveLocalLists(lists) {
  try {
    localStorage.setItem('armyLists', JSON.stringify(lists))
  } catch (err) {
    console.error('Error saving local lists:', err)
  }
}
