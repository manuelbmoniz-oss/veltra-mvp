import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { temRatingPendente } from '@/lib/rating'
import { Navbar } from '@/components/Navbar'
import { PedidoCard } from '@/components/PedidoCard'
import { StarRating, RatingDimensoes } from '@/components/StarRating'
import { Badge, CategoriaBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Dashboard Prestador' }

const LABEL_CATEGORIA: Record<string, string> = {
  LIMPEZA: 'Limpeza',
  CONTABILIDADE: 'Contabilidade',
  IT: 'IT',
  RH: 'RH',
  MARKETING: 'Marketing',
}

export default async function DashboardPrestadorPage({
  searchParams,
}: {
  searchParams: { categoria?: string; localizacao?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user as { empresaId?: string; tipoEmpresa?: string; prestadorId?: string }

  if (!user.prestadorId) redirect('/dashboard/cliente')

  const [prestador, pedidos, bloqueado] = await Promise.all([
    prisma.prestador.findUnique({
      where: { id: user.prestadorId },
      include: { empresa: { select: { nome: true, nif: true, morada: true } } },
    }),
    prisma.pedido.findMany({
      where: {
        status: 'ABERTO',
        ...(searchParams.categoria
          ? { categoria: searchParams.categoria as 'LIMPEZA' }
          : {}),
      },
      include: {
        empresaCliente: { select: { nome: true, morada: true } },
        _count: { select: { propostas: true } },
      },
      orderBy: { criadoEm: 'desc' },
    }),
    temRatingPendente(user.empresaId!, 'PRESTADOR'),
  ])

  if (!prestador) redirect('/dashboard/cliente')

  // Propostas submetidas
  const minhasPropostas = await prisma.proposta.findMany({
    where: { prestadorId: user.prestadorId },
    include: {
      pedido: { select: { titulo: true, status: true } },
    },
    orderBy: { criadoEm: 'desc' },
    take: 5,
  })

  const categoriasFiltro = prestador.categorias.length > 0
    ? Array.from(new Set(prestador.categorias))
    : ['LIMPEZA', 'CONTABILIDADE', 'IT', 'RH', 'MARKETING']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar: perfil do prestador */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-veltra-dark rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-lg">
                    {prestador.empresa.nome.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-base leading-tight">
                    {prestador.empresa.nome}
                  </h2>
                  <p className="text-xs text-gray-500">NIF {prestador.empresa.nif}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Rating global</p>
                <StarRating value={prestador.ratingGlobal} size="lg" />
                {prestador.totalAvaliacoes > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{prestador.totalAvaliacoes} avaliações</p>
                )}
              </div>

              {/* Categorias */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Categorias de serviço</p>
                <div className="flex flex-wrap gap-1">
                  {prestador.categorias.map((cat) => (
                    <CategoriaBadge key={cat} categoria={cat} />
                  ))}
                </div>
              </div>

              {/* Cobertura */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Área de cobertura</p>
                <p className="text-sm font-medium text-gray-800">
                  {prestador.raioKm ? `${prestador.raioKm} km` : 'Nacional'}
                </p>
              </div>
            </div>

            {/* Aviso de rating pendente */}
            {bloqueado && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-semibold text-amber-900 text-sm">Avaliação pendente</p>
                <p className="text-xs text-amber-700 mt-1">
                  Avalie o cliente anterior para poder responder a novos pedidos.
                </p>
              </div>
            )}

            {/* Propostas recentes */}
            {minhasPropostas.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Propostas recentes</h3>
                <div className="space-y-2">
                  {minhasPropostas.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.pedido.titulo}</p>
                        <p className="text-xs text-gray-500">{p.preco.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</p>
                      </div>
                      <Badge variant={p.status === 'ADJUDICADA' ? 'success' : p.status === 'REJEITADA' ? 'danger' : 'warning'}>
                        {p.status === 'ADJUDICADA' ? 'Adj.' : p.status === 'REJEITADA' ? 'Rej.' : 'Pend.'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conteúdo principal: pedidos disponíveis */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">Pedidos disponíveis</h1>
            </div>

            {/* Filtros de categoria */}
            <div className="flex gap-2 flex-wrap mb-4">
              <Link
                href="/dashboard/prestador"
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  !searchParams.categoria
                    ? 'bg-veltra-medium text-white border-veltra-medium'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-veltra-medium'
                }`}
              >
                Todos
              </Link>
              {categoriasFiltro.map((cat) => (
                <Link
                  key={cat}
                  href={`/dashboard/prestador?categoria=${cat}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    searchParams.categoria === cat
                      ? 'bg-veltra-medium text-white border-veltra-medium'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-veltra-medium'
                  }`}
                >
                  {LABEL_CATEGORIA[cat] ?? cat}
                </Link>
              ))}
            </div>

            {bloqueado ? (
              <div className="bg-white border border-amber-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 mb-1">Acesso temporariamente restrito</p>
                <p className="text-sm text-gray-500">
                  Complete a avaliação pendente para voltar a receber pedidos.
                </p>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <p className="text-gray-500 text-sm">
                  Sem pedidos disponíveis {searchParams.categoria ? 'nesta categoria' : ''} de momento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={{
                      ...pedido,
                      criadoEm: pedido.criadoEm.toISOString(),
                    }}
                    href={`/dashboard/prestador/pedidos/${pedido.id}`}
                    showCliente
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
