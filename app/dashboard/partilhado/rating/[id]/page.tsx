'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/StarRating'

interface FaturaInfo {
  id: string
  pedidoId: string
  confirmada: boolean
  pedido: { titulo: string }
  prestador: { id: string; empresa: { nome: string } }
  cliente: { id: string; nome: string }
  ratings: { avaliadorId: string; tipo: string }[]
}

interface DimensaoRatingProps {
  label: string
  descricao: string
  value: number
  onChange: (v: number) => void
}

function DimensaoRating({ label, descricao, value, onChange }: DimensaoRatingProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{descricao}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-veltra-dark">{value.toFixed(1)}</p>
        </div>
      </div>
      <StarRating value={value} size="lg" interactive onChange={onChange} />
    </div>
  )
}

export default function RatingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as { empresaId?: string; prestadorId?: string } | undefined

  const [fatura, setFatura] = useState<FaturaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [erro, setErro] = useState('')
  const [submetido, setSubmetido] = useState(false)

  // Dimensões cliente → prestador
  const [qualidade, setQualidade] = useState(0)
  const [prazos, setPrazos] = useState(0)
  const [fidelidadeOrcamental, setFidelidadeOrcamental] = useState(0)

  // Dimensões prestador → cliente
  const [pontualidadePagamento, setPontualidadePagamento] = useState(0)
  const [clareza, setClareza] = useState(0)
  const [facilidadeColaboracao, setFacilidadeColaboracao] = useState(0)

  const fetchFatura = useCallback(async () => {
    try {
      const res = await fetch(`/api/faturas/${id}`)
      if (!res.ok) { router.push('/dashboard/cliente'); return }
      const data = await res.json()
      setFatura(data)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchFatura() }, [fetchFatura])

  const isCliente = fatura?.cliente.id === user?.empresaId
  const isPrestador = fatura?.prestador.id === user?.prestadorId
  const jaAvaliou = fatura?.ratings.some((r) => r.avaliadorId === user?.empresaId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (isCliente && (!qualidade || !prazos || !fidelidadeOrcamental)) {
      setErro('Avalie todas as dimensões (clique nas estrelas).')
      return
    }
    if (isPrestador && (!pontualidadePagamento || !clareza || !facilidadeColaboracao)) {
      setErro('Avalie todas as dimensões (clique nas estrelas).')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faturaId: id,
          ...(isCliente ? { qualidade, prazos, fidelidadeOrcamental } : {}),
          ...(isPrestador ? { pontualidadePagamento, clareza, facilidadeColaboracao } : {}),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErro(data.erro || 'Erro ao submeter avaliação.')
        return
      }

      setSubmetido(true)
    } catch {
      setErro('Erro de ligação.')
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

  if (!fatura || !fatura.confirmada) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Avaliação não disponível.</p>
          <Link href="/dashboard/cliente" className="text-veltra-medium text-sm mt-4 block">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const dashboardHref = isCliente ? '/dashboard/cliente' : '/dashboard/prestador'

  if (jaAvaliou || submetido) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Avaliação submetida!</h2>
          <p className="text-gray-500 mb-8">
            Obrigado pelo seu feedback. Contribui para a qualidade da plataforma.
          </p>
          <Link href={dashboardHref}>
            <Button size="lg">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const mediaAtual = isCliente
    ? qualidade && prazos && fidelidadeOrcamental
      ? ((qualidade + prazos + fidelidadeOrcamental) / 3)
      : 0
    : pontualidadePagamento && clareza && facilidadeColaboracao
    ? ((pontualidadePagamento + clareza + facilidadeColaboracao) / 3)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={dashboardHref} className="hover:text-veltra-dark">Dashboard</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Avaliar</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {isCliente ? `Avaliar ${fatura.prestador.empresa.nome}` : `Avaliar ${fatura.cliente.nome}`}
            </h1>
            <p className="text-sm text-gray-500">Serviço: {fatura.pedido.titulo}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isCliente ? (
              <>
                <DimensaoRating
                  label="Qualidade do trabalho"
                  descricao="A qualidade do serviço prestado correspondeu às expectativas?"
                  value={qualidade}
                  onChange={setQualidade}
                />
                <DimensaoRating
                  label="Cumprimento de prazos"
                  descricao="O serviço foi entregue dentro dos prazos acordados?"
                  value={prazos}
                  onChange={setPrazos}
                />
                <DimensaoRating
                  label="Fidelidade orçamental"
                  descricao="O custo final foi fiel ao orçamento apresentado?"
                  value={fidelidadeOrcamental}
                  onChange={setFidelidadeOrcamental}
                />
              </>
            ) : (
              <>
                <DimensaoRating
                  label="Pontualidade de pagamento"
                  descricao="O cliente pagou dentro dos prazos acordados?"
                  value={pontualidadePagamento}
                  onChange={setPontualidadePagamento}
                />
                <DimensaoRating
                  label="Clareza do pedido"
                  descricao="O pedido estava bem descrito e era claro?"
                  value={clareza}
                  onChange={setClareza}
                />
                <DimensaoRating
                  label="Facilidade de colaboração"
                  descricao="A colaboração com este cliente foi fácil e construtiva?"
                  value={facilidadeColaboracao}
                  onChange={setFacilidadeColaboracao}
                />
              </>
            )}

            {/* Média calculada em tempo real */}
            {mediaAtual > 0 && (
              <div className="bg-veltra-lighter border border-veltra-light rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Média ponderada</p>
                <p className="text-3xl font-bold text-veltra-dark">{mediaAtual.toFixed(2)}</p>
                <div className="flex justify-center mt-1">
                  <StarRating value={mediaAtual} size="md" />
                </div>
              </div>
            )}

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full" size="lg">
              Submeter Avaliação
            </Button>

            <p className="text-xs text-center text-gray-400">
              A avaliação é anónima para efeitos de ranking. Não pode ser editada após submissão.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
