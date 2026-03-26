import Link from 'next/link'
import { StatusPedidoBadge, CategoriaBadge } from './ui/badge'

interface PedidoCardProps {
  pedido: {
    id: string
    titulo: string
    descricao: string
    categoria: string
    localizacao: string
    status: string
    criadoEm: string
    _count?: { propostas: number }
    empresaCliente?: { nome: string }
  }
  href: string
  showCliente?: boolean
}

export function PedidoCard({ pedido, href, showCliente = false }: PedidoCardProps) {
  const dataFormatada = new Date(pedido.criadoEm).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link href={href}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-veltra-medium transition-all p-5 cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CategoriaBadge categoria={pedido.categoria} />
              <StatusPedidoBadge status={pedido.status} />
            </div>
            <h3 className="font-semibold text-gray-900 text-base group-hover:text-veltra-dark transition-colors truncate">
              {pedido.titulo}
            </h3>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-veltra-medium shrink-0 mt-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{pedido.descricao}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {pedido.localizacao}
            </span>
            {showCliente && pedido.empresaCliente && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {pedido.empresaCliente.nome}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {pedido._count !== undefined && (
              <span className="flex items-center gap-1 text-veltra-medium font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {pedido._count.propostas} {pedido._count.propostas === 1 ? 'proposta' : 'propostas'}
              </span>
            )}
            <span>{dataFormatada}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
