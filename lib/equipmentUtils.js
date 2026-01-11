import { supabase } from './supabase'

/**
 * Expands equipment options by resolving weapon_list_reference types
 * @param {Array} equipmentOptions - Array of equipment option groups
 * @returns {Promise<Object>} - Object with { equipmentOptions, weaponListMetadata }
 */
export async function expandEquipmentOptions(equipmentOptions) {
  if (!equipmentOptions || equipmentOptions.length === 0) {
    return { equipmentOptions: [], weaponListMetadata: {} }
  }

  const expanded = []
  const weaponListMetadata = {}

  for (const group of equipmentOptions) {
    const expandedGroup = { 
      ...group, 
      options: [] 
    }

    for (const option of group.options) {
      // Check if this is a weapon list reference
      if (option.type === 'weapon_list_reference') {
        try {
          // Fetch weapon list info
          const { data: listData } = await supabase
            .from('weapon_lists')
            .select('name')
            .eq('id', option.list_id)
            .single()

          // Fetch weapons from the referenced list
          const { data: items, error } = await supabase
            .from('weapon_list_items')
            .select('name, cost')
            .eq('list_id', option.list_id)
            .order('sort_order')

          if (error) {
            console.error('Error fetching weapon list:', error)
            continue
          }

          // Transform items to match equipment options format
          const weaponOptions = items.map(item => ({
            name: item.name,
            cost: item.cost,
            replaces: option.replaces || []
          }))

          // Store metadata for the accordion UI
          // Use a unique key for this weapon list in this group
          const metadataKey = `${option.list_id}-${group.label}`
          weaponListMetadata[metadataKey] = {
            listName: listData?.name || option.list_id,
            listId: option.list_id,
            itemCount: items.length,
            items: weaponOptions
          }

          // Add a special marker option that represents the whole list
          expandedGroup.options.push({
            _isWeaponListGroup: true,
            _metadataKey: metadataKey,
            name: metadataKey, // Use metadata key as the "name"
            cost: 0,
            replaces: option.replaces || []
          })
        } catch (err) {
          console.error('Error expanding weapon list reference:', err)
        }
      } else {
        // Regular option - add as-is
        expandedGroup.options.push(option)
      }
    }

    expanded.push(expandedGroup)
  }

  return { equipmentOptions: expanded, weaponListMetadata }
}