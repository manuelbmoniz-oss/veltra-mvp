'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { PropostaCard } from '@/components/PropostaCard'
import { StatusPedidoBadge, CategoriaBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/input'

type OrdemPor =
  | 'preco_asc' | 'preco_desc'
  | 'rating_desc' | 'qualidade_desc' | 'prazos_desc' | 'fidelidade_desc'
  | 'avaliacoes_desc' | 'distancia_asc'

interface Proposta {
  id: string
  preco: number
  dataInicio: string
  dataConclusao: string
  validadeProposta?: string | null
  descricaoAbordagem?: string | null
  observacoes?: string | null
  status: string
  prestador: {
    id: string
    ratingGlobal: number | null
    totalAvaliacoes: number
    raioKm: number | null
    categorias: string[]
    empresa: { nome: string; morada?: string | null }
  }
}

interface Pedido {
  id: string
  titulo: string
  descricao: string
  categoria: string
  localizacao: string
  status: string
  criadoEm: string
  propostas: Proposta[]
  _count: { propostas: number }
}

const ORDENS: { value: OrdemPor; label: string }[] = [
  { value: 'preco_asc', label: 'Preço: mais barato' },
  { value: 'preco_desc', label: 'Preço: mais caro' },
  { value: 'rating_desc', label: 'Rating global' },
  { value: 'qualidade_desc', label: 'Qualidade' },
  { value: 'prazos_desc', label: 'Prazos' },
  { value: 'fidelidade_desc', label: 'Fidelidade orçamental' },
  { value: 'avaliacoes_desc', label: 'N.º de avaliações' },
]

export default function DetalhesPedidoClientePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [ordem, setOrdem] = useState<OrdemPor>('preco_asc')
  const [precoMax, setPrecoMax] = useState('')
  const [ratingMin, setRatingMin] = useState('')
  const [distMax, setDistMax] = useState('')

  const fetchPedido = useCallback(async () => {
    try {
      const res = await fetch(`/api/pedidos/${id}`)
      if (!res.ok) { router.push('/dashboard/cliente'); return }
      const data = await res.json()
      setPedido(data)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchPedido() }, [fetchPedido])

  async function handleAdjudicar(propostaId: string) {
    const ok = confirm('Tem a certeza que quer adjudicar esta proposta? As outras propostas serão rejeitadas.')
    if (!ok) return

    const res = await fetch(`/api/propostas/${propostaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'adjudicar' }),
    })

    if (res.ok) {
      await fetchPedido()
    } else {
      const data = await res.json()
      alert(data.erro || 'Erro ao adjudicar.')
    }
  }

  // Filtrar e ordenar propostas
  const propostas = (pedido?.propostas ?? []).filter((p) => {
    if (precoMax && p.preco > parseFloat(precoMax)) return false
    if (ratingMin && (p.prestador.ratingGlobal ?? 0) < parseFloat(ratingMin)) return false
    return true
  }).sort((a, b) => {
    switch (ordem) {
      case 'preco_asc': return a.preco - b.preco
      case 'preco_desc': return b.preco - a.preco
      case 'rating_desc': return (b.prestador.ratingGlobal ?? 0) - (a.prestador.ratingGlobal ?? 0)
      case 'avaliacoes_desc': return b.prestador.totalAvaliacoes - a.prestador.totalAvaliacoes
      default: return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-veltra-medium border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!pedido) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard/cliente" className="hover:text-veltra-dark">Dashboard</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium truncate">{pedido.titulo}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna esquerda: detalhes do pedido */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <CategoriaBadge categoria={pedido.categoria} />
                <StatusPedidoBadge status={pedido.status} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-3">{pedido.titulo}</h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{pedido.descricao}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {pedido.localizacao}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(pedido.criadoEm).toLocaleDateString('pt-PT')}
                </div>
              </div>
            </div>

            {/* Filtros */}
            {pedido.propostas.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Filtrar propostas</h3>
                <div className="space-y-3">
                  <Select
                    label="Ordenar por"
                    options={ORDENS.map(o => ({ value: o.value, label: o.label }))}
                    value={ordem}
                    onChange={(e) => setOrdem(e.target.value as OrdemPor)}
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Preço máximo (€)</label>
                    <input
                      type="number"
                      placeholder="sem limite"
                      value={precoMax}
                      onChange={(e) => setPrecoMax(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-veltra-medium"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Rating mínimo</label>
                    <input
                      type="number"
                      placeholder="ex: 4.0"
                      value={ratingMin}
                      onChange={(e) => setRatingMin(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-veltra-medium"
                      min="1" max="5" step="0.5"
                    />
                  </div>
                  {(precoMax || ratingMin || distMax) && (
                    <button
                      type="button"
                      onClick={() => { setPrecoMax(''); setRatingMin(''); setDistMax('') }}
                      className="text-xs text-veltra-medium hover:underline"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Link para fatura se adjudicado */}
            {(pedido.status === 'ADJUDICADO' || pedido.status === 'CONCLUIDO') && (
              <div className="bg-veltra-lighter border border-veltra-light rounded-2xl p-5">
                <p className="font-semibold text-veltra-dark text-sm mb-2">Serviço em curso</p>
                <p className="text-xs text-gray-600 mb-3">
                  Gerir fatura e concluir o serviço.
                </p>
                <Link href={`/dashboard/partilhado/fatura/${pedido.id}`}>
                  <Button variant="secondary" className="w-full" size="sm">
                    Gerir Fatura & Conclusão
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Coluna direita: propostas */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Propostas recebidas
                <span className="ml-2 text-sm font-normal text-gray-500">({propostas.length})</span>
              </h2>
            </div>

            {propostas.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-700">
                  {pedido._count.propostas === 0 ? 'Ainda sem propostas' : 'Sem propostas com estes filtros'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {pedido._count.propostas === 0
                    ? 'Os prestadores verificados irão receber notificação do seu pedido.'
                    : 'Experimente ajustar os filtros acima.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {propostas.map((proposta) => (
                  <PropostaCard
                    key={proposta.id}
                    proposta={{
                      ...proposta,
                      dataInicio: new Date(proposta.dataInicio).toISOString(),
                      dataConclusao: new Date(proposta.dataConclusao).toISOString(),
                    }}
                    podeAdjudicar={pedido.status === 'ABERTO'}
                    onAdjudicar={handleAdjudicar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
