'use client'

export default function RoleSelector({ onSelect }) {
  const availableRoles = ['Elites', 'Fast Attack', 'Heavy Support', 'Troops', 'Support']

  return (
    <div className="p-6">
      <p className="mb-4">Select a role to add to this detachment:</p>
      <div className="grid grid-cols-2 gap-4">
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className="px-4 py-3  border-2 border-accent rounded-lg p-4 text-left cursor-pointer"
          >
            <h4>{role}</h4>
          </button>
        ))}
      </div>
    </div>
  )
}