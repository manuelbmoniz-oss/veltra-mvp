'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'

type Passo = 'nif' | 'dados' | 'confirmacao'
type TipoEmpresa = 'CLIENTE' | 'PRESTADOR' | 'AMBOS'
type Categoria = 'LIMPEZA' | 'CONTABILIDADE' | 'IT' | 'RH' | 'MARKETING'

const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'LIMPEZA', label: 'Limpeza Técnica Especializada' },
  { value: 'CONTABILIDADE', label: 'Contabilidade & Gestão Fiscal' },
  { value: 'IT', label: 'Tecnologias de Informação' },
  { value: 'RH', label: 'Recursos Humanos' },
  { value: 'MARKETING', label: 'Marketing & Comunicação' },
]

export default function RegistoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipoParam = searchParams.get('tipo')

  const [passo, setPasso] = useState<Passo>('nif')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Campos
  const [nif, setNif] = useState('')
  const [dadosAT, setDadosAT] = useState<{ nome: string; cae: string; caeDescricao: string; morada: string } | null>(null)
  const [tipo, setTipo] = useState<TipoEmpresa>(
    tipoParam === 'prestador' ? 'PRESTADOR' : tipoParam === 'ambos' ? 'AMBOS' : 'CLIENTE'
  )
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [raioKm, setRaioKm] = useState<string>('')
  const [coberturaNacional, setCoberturaNacional] = useState(false)

  const isPrestador = tipo === 'PRESTADOR' || tipo === 'AMBOS'

  async function handleValidarNIF() {
    if (!/^\d{9}$/.test(nif)) {
      setErro('O NIF deve ter exatamente 9 dígitos.')
      return
    }
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/validar-nif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nif }),
      })
      const data = await res.json()
      if (!data.valido) {
        setErro(data.erro || 'NIF inválido.')
        return
      }
      if (data.jaRegistado) {
        setErro('Este NIF já está registado na plataforma.')
        return
      }
      setDadosAT({ nome: data.nome, cae: data.cae, caeDescricao: data.caeDescricao, morada: data.morada })
      setPasso('dados')
    } catch {
      setErro('Erro ao validar NIF. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (password !== passwordConfirm) {
      setErro('As passwords não coincidem.')
      return
    }
    if (password.length < 8) {
      setErro('A password deve ter pelo menos 8 caracteres.')
      return
    }
    if (isPrestador && categorias.length === 0) {
      setErro('Selecione pelo menos uma categoria de serviço.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/registo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nif,
          nome: dadosAT!.nome,
          cae: dadosAT!.cae,
          morada: dadosAT!.morada,
          email,
          telefone,
          password,
          tipo,
          categorias: isPrestador ? categorias : [],
          raioKm: isPrestador && !coberturaNacional && raioKm ? parseInt(raioKm) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'Erro ao criar conta.')
        return
      }
      setPasso('confirmacao')
    } catch {
      setErro('Erro de ligação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function toggleCategoria(cat: Categoria) {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  if (passo === 'confirmacao') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifique o seu email</h2>
          <p className="text-gray-600 mb-1">
            Enviámos um link de confirmação para
          </p>
          <p className="font-semibold text-veltra-dark mb-6">{email}</p>
          <p className="text-sm text-gray-500 mb-8">
            Clique no link no email para ativar a sua conta. O link é válido por 24 horas.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Ir para o Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-veltra-dark text-white py-4 px-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg">Veltra</span>
            <span className="text-veltra-light text-xs">Business Solutions</span>
          </Link>
          <Link href="/login" className="text-veltra-light text-sm hover:text-white">
            Já tenho conta →
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Indicador de passos */}
        <div className="flex items-center gap-2 mb-8">
          {(['nif', 'dados'] as Passo[]).map((p, i) => (
            <div key={p} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0
                ${passo === p ? 'bg-veltra-medium text-white' :
                  (i === 0 && passo === 'dados') ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i === 0 && passo === 'dados' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${passo === p ? 'text-veltra-dark font-medium' : 'text-gray-400'}`}>
                {p === 'nif' ? 'Validar NIF' : 'Dados da Empresa'}
              </span>
              {i < 1 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* PASSO 1: NIF */}
          {passo === 'nif' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Registe a sua empresa</h1>
              <p className="text-gray-600 mb-6 text-sm">
                Introduza o NIF da sua empresa. Validamos os dados junto da AT automaticamente.
              </p>

              <div className="space-y-4">
                <Input
                  label="NIF da Empresa"
                  placeholder="000000000"
                  value={nif}
                  onChange={(e) => setNif(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  maxLength={9}
                  inputMode="numeric"
                  required
                  hint="9 dígitos, sem espaços nem pontos"
                  error={erro}
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Tipo de conta</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'CLIENTE', label: 'Cliente', desc: 'Preciso de serviços' },
                      { value: 'PRESTADOR', label: 'Prestador', desc: 'Presto serviços' },
                      { value: 'AMBOS', label: 'Ambos', desc: 'Cliente e prestador' },
                    ] as { value: TipoEmpresa; label: string; desc: string }[]).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setTipo(opt.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          tipo === opt.value
                            ? 'border-veltra-medium bg-veltra-lighter'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className={`text-sm font-semibold ${tipo === opt.value ? 'text-veltra-dark' : 'text-gray-700'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleValidarNIF} loading={loading} className="w-full" size="lg">
                  Validar NIF
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 2: Dados */}
          {passo === 'dados' && dadosAT && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dados da Empresa</h1>
                <p className="text-gray-600 text-sm mb-4">Confirme os dados pré-preenchidos e complete o registo.</p>
              </div>

              {/* Dados da AT */}
              <div className="bg-veltra-lighter border border-veltra-light rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-veltra-dark">Dados validados pela AT</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">NIF</p>
                    <p className="font-medium text-gray-800">{nif}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">CAE</p>
                    <p className="font-medium text-gray-800">{dadosAT.cae}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Nome</p>
                    <p className="font-medium text-gray-800">{dadosAT.nome}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Morada</p>
                    <p className="font-medium text-gray-800">{dadosAT.morada}</p>
                  </div>
                </div>
              </div>

              <Input
                label="Email de contacto"
                type="email"
                placeholder="empresa@exemplo.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                hint="Será usado para login e notificações"
              />

              <Input
                label="Telefone"
                type="tel"
                placeholder="+351 900 000 000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirmar password"
                  type="password"
                  placeholder="Repita a password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>

              {/* Campos exclusivos de prestador */}
              {isPrestador && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Categorias de serviço <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIAS.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => toggleCategoria(cat.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            categorias.includes(cat.value)
                              ? 'bg-veltra-medium text-white border-veltra-medium'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-veltra-medium'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Área de cobertura</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={coberturaNacional}
                          onChange={(e) => setCoberturaNacional(e.target.checked)}
                          className="w-4 h-4 rounded text-veltra-medium"
                        />
                        <span className="text-sm text-gray-700">Cobertura nacional</span>
                      </label>
                      {!coberturaNacional && (
                        <Input
                          label="Raio de cobertura (km)"
                          type="number"
                          placeholder="ex: 50"
                          value={raioKm}
                          onChange={(e) => setRaioKm(e.target.value)}
                          min="1"
                          max="500"
                          hint="Distância máxima a que presta serviços"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {erro}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setPasso('nif'); setErro('') }} className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" loading={loading} className="flex-2 flex-[2]" size="lg">
                  Criar Conta
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Ao registar, aceita os{' '}
                <a href="#" className="text-veltra-medium hover:underline">Termos de Serviço</a>
                {' '}e a{' '}
                <a href="#" className="text-veltra-medium hover:underline">Política de Privacidade</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
