'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { INDUSTRIES } from '@/lib/config/industries'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#060666' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-6 h-14">
          <Link
            href="/"
            className="font-bold text-sm shrink-0 text-white tracking-tight"
          >
            Upfluence Creator Rankings
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {INDUSTRIES.map((industry) => {
              const isActive = pathname === `/industry/${industry.slug}`
              return (
                <Link
                  key={industry.slug}
                  href={`/industry/${industry.slug}`}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150',
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10',
                  )}
                  style={isActive ? { backgroundColor: '#ff4331' } : undefined}
                >
                  {industry.emoji} {industry.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
