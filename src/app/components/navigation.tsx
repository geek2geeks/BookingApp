'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '../lib/utils'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center h-16">
          <div className="flex items-center">
            <Link 
              href="/"
              className="text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              MBA7060
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 