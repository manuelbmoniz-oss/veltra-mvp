export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recalcularRatingPrestador } from '@/lib/rating'

// POST /api/ratings — submeter avaliação
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; tipoEmpresa?: string; prestadorId?: string }

  try {
    const body = await req.json()
    const {
      faturaId,
      qualidade,
      prazos,
      fidelidadeOrcamental,
      pontualidadePagamento,
      clareza,
      facilidadeColaboracao,
    } = body

    const fatura = await prisma.fatura.findUnique({
      where: { id: faturaId },
      include: {
        prestador: { include: { empresa: true } },
        ratings: { select: { avaliadorId: true } },
      },
    })

    if (!fatura) return NextResponse.json({ erro: 'Fatura não encontrada.' }, { status: 404 })
    if (!fatura.confirmada) {
      return NextResponse.json({ erro: 'A fatura ainda não foi confirmada.' }, { status: 400 })
    }

    const isCliente = fatura.clienteId === user.empresaId
    const isPrestador = fatura.prestadorId === user.prestadorId

    if (!isCliente && !isPrestador) {
      return NextResponse.json({ erro: 'Sem permissão.' }, { status: 403 })
    }

    // Verifica se já avaliou
    const jaAvaliou = fatura.ratings.some((r) => r.avaliadorId === user.empresaId)
    if (jaAvaliou) {
      return NextResponse.json({ erro: 'Já submeteu a sua avaliação.' }, { status: 409 })
    }

    const tipo = isCliente ? 'CLIENTE_AVALIA_PRESTADOR' : 'PRESTADOR_AVALIA_CLIENTE'
    const avaliadoId = isCliente ? fatura.prestador.empresa.id : fatura.clienteId

    // Calcula média ponderada
    let mediaPonderada: number
    if (isCliente) {
      const q = Number(qualidade) || 0
      const p = Number(prazos) || 0
      const f = Number(fidelidadeOrcamental) || 0
      mediaPonderada = (q + p + f) / 3
    } else {
      const pp = Number(pontualidadePagamento) || 0
      const cl = Number(clareza) || 0
      const fc = Number(facilidadeColaboracao) || 0
      mediaPonderada = (pp + cl + fc) / 3
    }

    const rating = await prisma.rating.create({
      data: {
        faturaId,
        avaliadorId: user.empresaId!,
        avaliadoId,
        tipo,
        qualidade: isCliente ? Number(qualidade) : null,
        prazos: isCliente ? Number(prazos) : null,
        fidelidadeOrcamental: isCliente ? Number(fidelidadeOrcamental) : null,
        pontualidadePagamento: !isCliente ? Number(pontualidadePagamento) : null,
        clareza: !isCliente ? Number(clareza) : null,
        facilidadeColaboracao: !isCliente ? Number(facilidadeColaboracao) : null,
        mediaPonderada: Math.round(mediaPonderada * 100) / 100,
      },
    })

    // Recalcula rating global do prestador
    if (isCliente) {
      await recalcularRatingPrestador(fatura.prestadorId)
    }

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    console.error('[POST /api/ratings]', error)
    return NextResponse.json({ erro: 'Erro ao submeter avaliação.' }, { status: 500 })
  }
}
