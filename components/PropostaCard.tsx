'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { StatusPropostaBadge } from './ui/badge'
import { StarRating, RatingDimensoes } from './StarRating'

interface PropostaCardProps {
  proposta: {
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
      empresa: {
        nome: string
        morada?: string | null
      }
    }
    distanciaKm?: number | null
  }
  podeAdjudicar?: boolean
  onAdjudicar?: (propostaId: string) => Promise<void>
}

export function PropostaCard({ proposta, podeAdjudicar, onAdjudicar }: PropostaCardProps) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function handleAdjudicar() {
    if (!onAdjudicar) return
    setLoading(true)
    try {
      await onAdjudicar(proposta.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base">{proposta.prestador.empresa.nome}</h3>
            <StatusPropostaBadge status={proposta.status} />
          </div>
          {proposta.prestador.empresa.morada && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {proposta.prestador.empresa.morada}
              {proposta.distanciaKm != null && (
                <span className="ml-1 text-veltra-medium">({proposta.distanciaKm.toFixed(0)} km)</span>
              )}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-veltra-dark">
            {proposta.preco.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs text-gray-400">sem IVA</p>
        </div>
      </div>

      {/* Rating global */}
      <div className="mb-2">
        {proposta.prestador.ratingGlobal !== null ? (
          <div className="flex items-center gap-2">
            <StarRating value={proposta.prestador.ratingGlobal} size="md" />
            <span className="text-xs text-gray-500">({proposta.prestador.totalAvaliacoes} avaliações)</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Novo na Plataforma</span>
        )}
      </div>

      {/* Dimensões compactas */}
      {proposta.prestador.ratingGlobal !== null && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          <RatingDimensoes
            qualidade={null}
            prazos={null}
            fidelidadeOrcamental={null}
            compact
          />
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Início previsto</p>
          <p className="font-medium text-gray-800">
            {new Date(proposta.dataInicio).toLocaleDateString('pt-PT')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Conclusão prevista</p>
          <p className="font-medium text-gray-800">
            {new Date(proposta.dataConclusao).toLocaleDateString('pt-PT')}
          </p>
        </div>
        {proposta.validadeProposta && (
          <div>
            <p className="text-xs text-gray-500">Proposta válida até</p>
            <p className="font-medium text-gray-800">
              {new Date(proposta.validadeProposta).toLocaleDateString('pt-PT')}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">Cobertura</p>
          <p className="font-medium text-gray-800">
            {proposta.prestador.raioKm ? `${proposta.prestador.raioKm} km` : 'Nacional'}
          </p>
        </div>
      </div>

      {/* Expansão */}
      {(proposta.descricaoAbordagem || proposta.observacoes) && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-veltra-medium hover:underline mb-2 flex items-center gap-1"
          >
            {expanded ? 'Ver menos' : 'Ver detalhes da proposta'}
            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded && (
            <div className="space-y-2 mb-3">
              {proposta.descricaoAbordagem && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Abordagem</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                    {proposta.descricaoAbordagem}
                  </p>
                </div>
              )}
              {proposta.observacoes && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Observações</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">
                    {proposta.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Acção */}
      {podeAdjudicar && proposta.status === 'PENDENTE' && (
        <Button
          onClick={handleAdjudicar}
          loading={loading}
          className="w-full mt-2"
          size="md"
        >
          Adjudicar Proposta
        </Button>
      )}
    </div>
  )
}
