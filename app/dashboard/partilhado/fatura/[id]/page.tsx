'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Fatura {
  id: string
  pedidoId: string
  valor: number
  numeroFatura: string
  ficheiroUrl: string | null
  carregadaPor: 'PRESTADOR' | 'CLIENTE' | null
  confirmada: boolean
  confirmadaEm: string | null
  pedido: { titulo: string; status: string }
  prestador: { id: string; empresa: { nome: string; email: string } }
  cliente: { id: string; nome: string }
  ratings: { avaliadorId: string; tipo: string }[]
}

export default function FaturaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as { empresaId?: string; prestadorId?: string; tipoEmpresa?: string } | undefined

  const [fatura, setFatura] = useState<Fatura | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Campos de upload
  const [ficheiroUrl, setFicheiroUrl] = useState('')
  const [numeroFatura, setNumeroFatura] = useState('')
  const [valor, setValor] = useState('')

  const fetchFatura = useCallback(async () => {
    try {
      const res = await fetch(`/api/faturas/${id}`)
      if (!res.ok) { router.push('/dashboard/cliente'); return }
      const data = await res.json()
      setFatura(data)
      setNumeroFatura(data.numeroFatura || '')
      setValor(data.valor?.toString() || '')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchFatura() }, [fetchFatura])

  const isCliente = fatura?.cliente.id === user?.empresaId
  const isPrestador = fatura?.prestador.id === user?.prestadorId

  const jaAvaliou = fatura?.ratings.some((r) => r.avaliadorId === user?.empresaId)
  const podeAvaliar = fatura?.confirmada && !jaAvaliou

  async function handleCarregar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!ficheiroUrl) {
      setErro('Introduza o URL do ficheiro da fatura.')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch(`/api/faturas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'carregar', ficheiroUrl, numeroFatura, valor }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || 'Erro.'); return }
      setSucesso('Fatura carregada com sucesso!')
      await fetchFatura()
    } catch {
      setErro('Erro de ligação.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleConfirmar() {
    const ok = confirm('Confirmar a receção desta fatura? O serviço ficará marcado como concluído e as avaliações serão desbloqueadas.')
    if (!ok) return
    setErro('')
    setActionLoading(true)
    try {
      const res = await fetch(`/api/faturas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'confirmar' }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro || 'Erro.'); return }
      setSucesso('Fatura confirmada! Pode agora avaliar o prestador.')
      await fetchFatura()
    } catch {
      setErro('Erro de ligação.')
    } finally {
      setActionLoading(false)
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

  if (!fatura) return null

  const dashboardHref = isCliente ? '/dashboard/cliente' : '/dashboard/prestador'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={dashboardHref} className="hover:text-veltra-dark">Dashboard</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Fatura & Conclusão</span>
        </div>

        {/* Cabeçalho do serviço */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={fatura.confirmada ? 'success' : 'warning'}>
              {fatura.confirmada ? 'Concluído' : 'Em curso'}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">{fatura.pedido.titulo}</h1>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium text-gray-800">{fatura.cliente.nome}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Prestador</p>
              <p className="font-medium text-gray-800">{fatura.prestador.empresa.nome}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Valor acordado</p>
              <p className="font-semibold text-veltra-dark text-lg">
                {fatura.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">N.º Fatura</p>
              <p className="font-medium text-gray-800">{fatura.numeroFatura}</p>
            </div>
          </div>
        </div>

        {/* Timeline de estado */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Estado do processo</h2>
          <div className="space-y-3">
            {[
              {
                label: 'Proposta adjudicada',
                done: true,
                desc: 'O cliente adjudicou a proposta.',
              },
              {
                label: 'Fatura carregada',
                done: !!fatura.ficheiroUrl,
                desc: fatura.ficheiroUrl
                  ? `Carregada por ${fatura.carregadaPor === 'PRESTADOR' ? 'prestador' : 'cliente'}.`
                  : 'Aguarda carregamento por qualquer das partes.',
              },
              {
                label: 'Fatura confirmada pelo cliente',
                done: fatura.confirmada,
                desc: fatura.confirmada
                  ? `Confirmada em ${new Date(fatura.confirmadaEm!).toLocaleDateString('pt-PT')}.`
                  : 'Aguarda confirmação do cliente.',
              },
              {
                label: 'Avaliações',
                done: (fatura.ratings?.length ?? 0) >= 2,
                desc: `${fatura.ratings?.length ?? 0}/2 avaliações submetidas.`,
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  step.done ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  {step.done ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acções */}
        {!fatura.ficheiroUrl ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-1">Carregar fatura</h2>
            <p className="text-sm text-gray-500 mb-4">
              {isPrestador
                ? 'Após execução do serviço, carregue a fatura. O cliente será notificado.'
                : 'Se recebeu a fatura por outro canal, pode carregá-la aqui.'}
            </p>
            <form onSubmit={handleCarregar} className="space-y-3">
              <Input
                label="URL da fatura (Supabase Storage ou link direto)"
                type="url"
                placeholder="https://..."
                value={ficheiroUrl}
                onChange={(e) => setFicheiroUrl(e.target.value)}
                required
                hint="No MVP, cole o URL do ficheiro PDF. Em produção: upload direto."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="N.º da fatura"
                  placeholder="ex: FT 2025/001"
                  value={numeroFatura}
                  onChange={(e) => setNumeroFatura(e.target.value)}
                />
                <Input
                  label="Valor final (€)"
                  type="number"
                  placeholder={fatura.valor.toString()}
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  step="0.01"
                />
              </div>
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{erro}</div>
              )}
              <Button type="submit" loading={actionLoading} className="w-full">
                Carregar Fatura
              </Button>
            </form>
          </div>
        ) : !fatura.confirmada && isCliente ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Confirmar fatura</h2>
            <p className="text-sm text-gray-500 mb-4">
              Verifique o documento e confirme a receção. Após confirmação, as avaliações são desbloqueadas.
            </p>
            <div className="bg-veltra-lighter rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-veltra-dark mb-1">Fatura disponível</p>
              <a
                href={fatura.ficheiroUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-veltra-medium text-sm hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Abrir documento PDF
              </a>
            </div>
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-3">{erro}</div>
            )}
            <Button onClick={handleConfirmar} loading={actionLoading} className="w-full">
              Confirmar Receção da Fatura
            </Button>
          </div>
        ) : fatura.confirmada && !isCliente && fatura.ficheiroUrl ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Fatura confirmada pelo cliente</p>
            <a
              href={fatura.ficheiroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-veltra-medium text-sm hover:underline flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver fatura
            </a>
          </div>
        ) : null}

        {/* Avaliação */}
        {podeAvaliar && (
          <div className="bg-veltra-lighter border border-veltra-light rounded-2xl p-6">
            <h2 className="font-semibold text-veltra-dark mb-2">Avaliação desbloqueada</h2>
            <p className="text-sm text-gray-600 mb-4">
              O serviço está concluído. A sua avaliação ajuda a manter a qualidade da plataforma.
            </p>
            <Link href={`/dashboard/partilhado/rating/${id}`}>
              <Button className="w-full">
                Avaliar agora
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </Button>
            </Link>
          </div>
        )}

        {jaAvaliou && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-green-800 font-medium">A sua avaliação foi submetida. Obrigado!</p>
          </div>
        )}

        {sucesso && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 mt-4">
            {sucesso}
          </div>
        )}
      </main>
    </div>
  )
}
