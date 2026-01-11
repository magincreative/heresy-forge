'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import EquipmentOptions from '@/components/EquipmentOptions'
import PrimeBenefitSelector from '@/components/PrimeBenefitSelector'
import { expandEquipmentOptions } from '@/lib/equipmentUtils'



export default function EditUnitPage() {
  const params = useParams()
  const router = useRouter()
  const [list, setList] = useState(null)
  const [unit, setUnit] = useState(null)
  const [unitTemplate, setUnitTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedEquipment, setSelectedEquipment] = useState([])
  const equipmentCost = selectedEquipment.reduce((sum, eq) => sum + eq.cost, 0)
  const totalCost = unitTemplate ? unitTemplate.base_cost + equipmentCost : 0
  const [selectedBenefit, setSelectedBenefit] = useState(null)
  const [primeBenefits, setPrimeBenefits] = useState([])
  const [detachment, setDetachment] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (unit) {
      setSelectedEquipment(unit.equipment || [])
      setSelectedBenefit(unit.primeBenefit || null)
    }
  }, [unit])

  const loadData = async () => {
    const lists = JSON.parse(localStorage.getItem('armyLists') || '[]')
    const foundList = lists.find(l => l.id === params.id)

    // Load prime benefits from Supabase
    const { data: benefits } = await supabase
      .from('prime_benefits')
      .select('*')

    setPrimeBenefits(benefits || [])
    
    if (foundList) {
      setList(foundList)
      
      // Find the unit in the list
      let foundUnit = null
      let foundDetachment = null
      for (const detachment of foundList.detachments) {
        foundUnit = detachment.units.find(u => u.id === params.unitId)
        if (foundUnit) {
          foundDetachment = detachment
          break
        }
      }
      
      if (foundUnit) {
        setUnit(foundUnit)
        setDetachment(foundDetachment) 
        
        // Load unit template from Supabase
        const { data } = await supabase
          .from('units')
          .select('*')
          .eq('id', foundUnit.unitId)
          .single()
        
        // Expand weapon list references
        if (data && data.equipment_options) {
          const { equipmentOptions, weaponListMetadata } = await expandEquipmentOptions(data.equipment_options)
          setUnitTemplate({
            ...data,
            equipment_options: equipmentOptions,
            weaponListMetadata: weaponListMetadata
          })
        } else {
          setUnitTemplate(data)
        }
      }
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!unit || !unitTemplate) {
    return (
      <div className="text-center py-8">
        <p>Unit not found</p>
        <Link href={`/list/${params.id}`} className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to List
        </Link>
      </div>
    )
  }

  const handleSave = () => {
    console.log('Selected benefit:', selectedBenefit)
    console.log('Unit isPrimeSlot:', unit.isPrimeSlot)

    // Update unit with new equipment
    const updatedUnit = {
      ...unit,
      equipment: selectedEquipment,
      equipmentCost: equipmentCost,
      totalCost: totalCost,
      primeBenefit: selectedBenefit,
    }

    console.log('Updated unit:', updatedUnit)

    // Update list with modified unit
    const updatedList = {
      ...list,
      detachments: list.detachments.map(detachment => ({
        ...detachment,
        units: detachment.units.map(u => 
          u.id === unit.id ? updatedUnit : u
        ),
        totalPoints: detachment.units.map(u => 
          u.id === unit.id ? updatedUnit : u
        ).reduce((sum, u) => sum + u.totalCost, 0)
      }))
    }

    // Recalculate list total
    updatedList.totalPoints = updatedList.detachments.reduce(
      (sum, d) => sum + d.totalPoints,
      0
    )

    // Save to localStorage
    const lists = JSON.parse(localStorage.getItem('armyLists') || '[]')
    const listIndex = lists.findIndex(l => l.id === list.id)
    if (listIndex !== -1) {
      lists[listIndex] = updatedList
      localStorage.setItem('armyLists', JSON.stringify(lists))
    }

    // Go back to list
    router.push(`/list/${params.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/list/${params.id}`} className="text-accent hover:underline mb-4 inline-block">
        ← Back to List
      </Link>
      
      <div className=" rounded-lg shadow p-6">
        <div className="flex flex-row justify-between">
          <div>
            <h2 className="mb-2">{unitTemplate.name}</h2>
            <p className="text-secondary mb-4">{unitTemplate.role}</p>
          </div>
          <div className="text-right">
            <h2 className="mb-2">{totalCost} pts</h2>
            <p className="text-secondary mb-4">Base: {unitTemplate.base_cost} pts</p>
          </div>
        </div>
        
        {unitTemplate.special_rules && (
          <div className="mb-6">
            <h3 className="mb-4">Special Rules</h3>
            <ul className="flex text-sm gap-4">
              {unitTemplate.special_rules.map((item, i) => (
                <li key={i} className="inline px-2 py-0.5 uppercase border rounded text-accent font-bold border-accent">{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-4">Base Wargear</h3>
          <ul className="text-sm flex gap-4">
            {unitTemplate.base_wargear.map((item, i) => (
              <li key={i} className="inline px-2 py-0.5 uppercase border rounded text-accent font-bold border-accent">{item}</li>
            ))}
          </ul>
        </div>

        {unitTemplate.equipment_options && unitTemplate.equipment_options.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-4">Equipment Options:</h3>
            <EquipmentOptions
              optionGroups={unitTemplate.equipment_options}
              selectedEquipment={selectedEquipment}
              onEquipmentChange={setSelectedEquipment}
              weaponListMetadata={unitTemplate.weaponListMetadata || {}}
            />
          </div>
        )}
        <PrimeBenefitSelector
          benefits={primeBenefits}
          selectedBenefit={selectedBenefit}
          onBenefitChange={setSelectedBenefit}
          isPrimeSlot={unit.isPrimeSlot}
          detachment={detachment}
          currentUnitId={unit.id}
        />

        <div className="flex gap-4 pt-8 border-t">
          <button 
            onClick={handleSave}
            className="flex-1 btn btn-primary btn-lg">
            Save Changes
          </button>
          <button 
            onClick={() => router.push(`/list/${params.id}`)}
            className="btn btn-secondary btn-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}