import { supabase } from '@/lib/supabase'

export default async function TestDB() {
  // Fetch all units
  const { data: units, error } = await supabase
    .from('units')
    .select('*')

  if (error) {
    return <div className="p-8">Error: {error.message}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <p className="mb-4">✅ Connected to Supabase!</p>
      
      <h2 className="text-xl font-semibold mb-2">Units ({units.length}):</h2>
      <ul className="list-disc pl-6">
        {units.map(unit => (
          <li key={unit.id}>
            {unit.name} - {unit.role} - {unit.base_cost} pts
          </li>
        ))}
      </ul>
    </div>
  )
}