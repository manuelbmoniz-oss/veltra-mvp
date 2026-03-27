'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/cliente'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const erroParam = searchParams.get('error')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      if (res.error === 'EMAIL_NAO_CONFIRMADO') {
        setErro('Por favor confirme o seu email antes de iniciar sessão.')
      } else if (res.error === 'CONTA_SUSPENSA') {
        setErro('A sua conta está suspensa. Contacte o suporte.')
      } else {
        setErro('Email ou password incorretos.')
      }
      return
    }

    // Redireciona para o dashboard correto baseado no tipo
    const meRes = await fetch('/api/me')
    const me = await meRes.json()
    const tipo = me?.tipoEmpresa

    if (tipo === 'PRESTADOR') {
      router.push('/dashboard/prestador')
    } else {
      router.push('/dashboard/cliente')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-veltra-dark text-white py-4 px-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">Veltra</span>
            <span className="text-veltra-light text-xs">Business Solutions</span>
          </Link>
          <Link href="/registo" className="text-veltra-light text-sm hover:text-white">
            Criar conta →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-veltra-lighter rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-veltra-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="text-gray-500 text-sm mt-1">Inicie sessão na sua conta Veltra</p>
          </div>

          {/* Erro do parâmetro URL (ex: sessão expirada) */}
          {erroParam === 'SessionRequired' && !erro && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 mb-4">
              Precisa de iniciar sessão para aceder a esta página.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="empresa@exemplo.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="A sua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div className="mt-1 text-right">
                <a href="#" className="text-xs text-veltra-medium hover:underline">
                  Esqueceu a password?
                </a>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Iniciar Sessão
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem conta?{' '}
              <Link href="/registo" className="text-veltra-medium font-medium hover:underline">
                Registar empresa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">A carregar...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
