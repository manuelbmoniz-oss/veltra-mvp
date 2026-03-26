'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { CategoriaBadge, StatusPedidoBadge, StatusPropostaBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

interface Pedido {
  id: string
  titulo: string
  descricao: string
  categoria: string
  localizacao: string
  status: string
  criadoEm: string
  empresaCliente: { nome: string; morada?: string | null }
  propostas: {
    id: string
    preco: number
    dataInicio: string
    dataConclusao: string
    status: string
  }[]
}

export default function DetalhesPedidoPrestadorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [jaSubmiteu, setJaSubmiteu] = useState(false)

  // Campos da proposta
  const [preco, setPreco] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataConclusao, setDataConclusao] = useState('')
  const [validadeProposta, setValidadeProposta] = useState('')
  const [descricaoAbordagem, setDescricaoAbordagem] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const fetchPedido = useCallback(async () => {
    try {
      const res = await fetch(`/api/pedidos/${id}`)
      if (!res.ok) { router.push('/dashboard/prestador'); return }
      const data = await res.json()
      setPedido(data)
      setJaSubmiteu(data.propostas.length > 0)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchPedido() }, [fetchPedido])

  async function handleSubmitProposta(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!preco || !dataInicio || !dataConclusao) {
      setErro('Preencha os campos obrigatórios: preço, data de início e data de conclusão.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/propostas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: id,
          preco: parseFloat(preco),
          dataInicio,
          dataConclusao,
          validadeProposta: validadeProposta || null,
          descricaoAbordagem: descricaoAbordagem || null,
          observacoes: observacoes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'Erro ao submeter proposta.')
        return
      }

      setSucesso('Proposta submetida com sucesso!')
      await fetchPedido()
    } catch {
      setErro('Erro de ligação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

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

  const minhaProposta = pedido.propostas[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard/prestador" className="hover:text-veltra-dark">Dashboard</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium truncate">{pedido.titulo}</span>
        </div>

        {/* Detalhe do pedido */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <CategoriaBadge categoria={pedido.categoria} />
            <StatusPedidoBadge status={pedido.status} />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">{pedido.titulo}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {pedido.empresaCliente.nome}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {pedido.localizacao}
            </span>
            <span>{new Date(pedido.criadoEm).toLocaleDateString('pt-PT')}</span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">
            {pedido.descricao}
          </p>
        </div>

        {/* Secção de proposta */}
        {jaSubmiteu && minhaProposta ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">A sua proposta</h2>
              <StatusPropostaBadge status={minhaProposta.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Preço proposto</p>
                <p className="font-semibold text-veltra-dark text-lg">
                  {minhaProposta.preco.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Início</p>
                <p className="font-medium text-gray-800">
                  {new Date(minhaProposta.dataInicio).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Conclusão</p>
                <p className="font-medium text-gray-800">
                  {new Date(minhaProposta.dataConclusao).toLocaleDateString('pt-PT')}
                </p>
              </div>
            </div>

            {minhaProposta.status === 'ADJUDICADA' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-green-700 font-medium mb-3">
                  A sua proposta foi adjudicada! Pode agora carregar a fatura.
                </p>
                <Link href={`/dashboard/partilhado/fatura/${pedido.id}`}>
                  <Button className="w-full">
                    Gerir Fatura & Conclusão
                  </Button>
                </Link>
              </div>
            )}

            {sucesso && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                {sucesso}
              </div>
            )}
          </div>
        ) : pedido.status !== 'ABERTO' ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-500">Este pedido já não está disponível para propostas.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Submeter Proposta</h2>
            <p className="text-sm text-gray-500 mb-6">Os campos com * são obrigatórios.</p>

            <form onSubmit={handleSubmitProposta} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Preço (€, sem IVA)"
                  type="number"
                  placeholder="ex: 1500"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Validade da proposta"
                  type="date"
                  value={validadeProposta}
                  onChange={(e) => setValidadeProposta(e.target.value)}
                  hint="Data limite de aceitação"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Data de início prevista"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                />
                <Input
                  label="Data de conclusão prevista"
                  type="date"
                  value={dataConclusao}
                  onChange={(e) => setDataConclusao(e.target.value)}
                  required
                />
              </div>

              <Textarea
                label="Descrição da abordagem"
                placeholder="Descreva como irá executar o serviço, metodologia, equipa, etc."
                value={descricaoAbordagem}
                onChange={(e) => setDescricaoAbordagem(e.target.value)}
                rows={4}
              />

              <Textarea
                label="Observações"
                placeholder="Condições especiais, requisitos, exclusões, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />

              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {erro}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Link href="/dashboard/prestador" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" loading={submitting} className="flex-[2]" size="lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submeter Proposta
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
