import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { temRatingPendente } from '@/lib/rating'
import { Navbar } from '@/components/Navbar'
import { PedidoCard } from '@/components/PedidoCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Dashboard Cliente' }

export default async function DashboardClientePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user as { empresaId?: string; tipoEmpresa?: string }
  if (user.tipoEmpresa === 'PRESTADOR') redirect('/dashboard/prestador')

  const [pedidos, empresa, bloqueado] = await Promise.all([
    prisma.pedido.findMany({
      where: { empresaClienteId: user.empresaId },
      include: { _count: { select: { propostas: true } } },
      orderBy: { criadoEm: 'desc' },
    }),
    prisma.empresa.findUnique({
      where: { id: user.empresaId },
      select: { nome: true, nif: true, tipo: true },
    }),
    temRatingPendente(user.empresaId!, 'CLIENTE'),
  ])

  const stats = {
    total: pedidos.length,
    abertos: pedidos.filter((p) => p.status === 'ABERTO').length,
    adjudicados: pedidos.filter((p) => p.status === 'ADJUDICADO').length,
    concluidos: pedidos.filter((p) => p.status === 'CONCLUIDO').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{empresa?.nome} · NIF {empresa?.nif}</p>
          </div>
          {bloqueado ? (
            <div className="flex items-center gap-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Tem uma avaliação pendente antes de poder criar pedidos
              </div>
            </div>
          ) : (
            <Link href="/dashboard/cliente/novo-pedido">
              <Button size="lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Pedido
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-800' },
            { label: 'Abertos', value: stats.abertos, color: 'text-green-700' },
            { label: 'Adjudicados', value: stats.adjudicados, color: 'text-blue-700' },
            { label: 'Concluídos', value: stats.concluidos, color: 'text-gray-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Aviso de rating pendente */}
        {bloqueado && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-900">Avaliação pendente</p>
              <p className="text-sm text-amber-700 mt-1">
                Tem um serviço concluído que aguarda avaliação. Complete-a para poder publicar novos pedidos.
              </p>
            </div>
            <Link href="/dashboard/cliente">
              <Button variant="secondary" size="sm">Ver avaliações</Button>
            </Link>
          </div>
        )}

        {/* Lista de pedidos */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Os meus pedidos</h2>
          {pedidos.length > 0 && (
            <Badge variant="neutral">{pedidos.length} pedidos</Badge>
          )}
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-veltra-lighter rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-veltra-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ainda sem pedidos</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
              Publique o seu primeiro pedido e receba propostas de prestadores verificados.
            </p>
            {!bloqueado && (
              <Link href="/dashboard/cliente/novo-pedido">
                <Button size="lg">Criar primeiro pedido</Button>
              </Link>
            )}
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
                href={`/dashboard/cliente/pedidos/${pedido.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
