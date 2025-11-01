import React from 'react'
import { User, Palette } from 'lucide-react'

export type UserRole = 'user' | 'tattoo_artist'

interface RoleSelectorProps {
  value: UserRole | null
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const roles: Array<{ id: UserRole; label: string; description: string; icon: React.ReactNode }> =
    [
      {
        id: 'user',
        label: 'Usuario',
        description: 'Explora y descubre arte de tatuajes',
        icon: <User size={24} />,
      },
      {
        id: 'tattoo_artist',
        label: 'Tatuador',
        description: 'Comparte tu arte y conecta con clientes',
        icon: <Palette size={24} />,
      },
    ]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2 text-white">Tipo de cuenta</label>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              value === role.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`${
                  value === role.id ? 'text-purple-400' : 'text-gray-400'
                } transition-colors`}
              >
                {role.icon}
              </div>
              <div className="text-center">
                <div
                  className={`font-medium ${
                    value === role.id ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {role.label}
                </div>
                <div className="text-xs text-gray-400 mt-1">{role.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

