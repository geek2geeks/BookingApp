'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '../lib/utils'

const themes = [
  {
    id: 'light',
    name: 'Light',
    icon: Sun,
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
  },
  {
    id: 'system',
    name: 'System',
    icon: Monitor,
  },
]

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'inline-flex items-center justify-center p-2 rounded-md',
          'text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200',
          'hover:bg-gray-100 dark:hover:bg-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
      >
        <span className="sr-only">Toggle theme</span>
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className={cn(
            'w-36 rounded-lg shadow-lg p-1',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700'
          )}
        >
          {themes.map(({ id, name, icon: Icon }) => (
            <DropdownMenu.Item
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                'flex items-center w-full px-2 py-1.5 text-sm rounded-md',
                'text-gray-700 dark:text-gray-300',
                'focus:outline-none',
                theme === id
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                'cursor-pointer'
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
} 