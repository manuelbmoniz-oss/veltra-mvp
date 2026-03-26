'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const tipoEmpresa = (session?.user as { tipoEmpresa?: string } | undefined)?.tipoEmpresa

  const dashboardHref =
    tipoEmpresa === 'PRESTADOR'
      ? '/dashboard/prestador'
      : tipoEmpresa === 'AMBOS'
      ? '/dashboard/cliente'
      : '/dashboard/cliente'

  return (
    <nav className="bg-veltra-dark border-b border-veltra-medium/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-veltra-medium rounded-lg p-1.5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Veltra</span>
            <span className="text-veltra-light text-xs hidden sm:block mt-0.5">Business Solutions</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-veltra-light hover:text-white text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-veltra-medium/20"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 ml-2">
                  <div className="text-right">
                    <p className="text-white text-sm font-medium leading-tight">
                      {session.user?.name}
                    </p>
                    <p className="text-veltra-light text-xs">
                      {tipoEmpresa === 'PRESTADOR' ? 'Prestador' :
                       tipoEmpresa === 'CLIENTE' ? 'Cliente' : 'Cliente & Prestador'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="border-veltra-light/50 text-veltra-light hover:bg-veltra-medium/20 hover:text-white"
                  >
                    Sair
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-veltra-light hover:text-white hover:bg-veltra-medium/20">
                    Entrar
                  </Button>
                </Link>
                <Link href="/registo">
                  <Button size="sm" className="bg-veltra-medium hover:bg-veltra-light hover:text-veltra-dark">
                    Registar Empresa
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-veltra-light hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-veltra-dark border-t border-veltra-medium/30 px-4 py-3 space-y-2">
          {session ? (
            <>
              <Link href={dashboardHref} className="block text-veltra-light hover:text-white py-2 text-sm">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block text-veltra-light hover:text-white py-2 text-sm w-full text-left"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-veltra-light hover:text-white py-2 text-sm">
                Entrar
              </Link>
              <Link href="/registo" className="block text-veltra-light hover:text-white py-2 text-sm">
                Registar Empresa
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
