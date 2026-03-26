export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { temRatingPendente } from '@/lib/rating'

// POST /api/propostas — submeter proposta
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; tipoEmpresa?: string; prestadorId?: string }

  if (!user.prestadorId) {
    return NextResponse.json({ erro: 'Apenas prestadores podem submeter propostas.' }, { status: 403 })
  }

  try {
    // Verifica rating pendente
    const bloqueado = await temRatingPendente(user.empresaId!, 'PRESTADOR')
    if (bloqueado) {
      return NextResponse.json(
        { erro: 'Tem uma avaliação pendente. Complete-a antes de submeter novas propostas.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { pedidoId, preco, dataInicio, dataConclusao, validadeProposta, descricaoAbordagem, observacoes } = body

    if (!pedidoId || !preco || !dataInicio || !dataConclusao) {
      return NextResponse.json({ erro: 'Campos obrigatórios em falta.' }, { status: 400 })
    }

    // Verifica se o pedido está aberto
    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } })
    if (!pedido) return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 })
    if (pedido.status !== 'ABERTO') {
      return NextResponse.json({ erro: 'Este pedido já não está aberto.' }, { status: 409 })
    }

    // Verifica se já submeteu proposta
    const propostaExistente = await prisma.proposta.findFirst({
      where: { pedidoId, prestadorId: user.prestadorId },
    })
    if (propostaExistente) {
      return NextResponse.json({ erro: 'Já submeteu uma proposta para este pedido.' }, { status: 409 })
    }

    const proposta = await prisma.proposta.create({
      data: {
        pedidoId,
        prestadorId: user.prestadorId,
        preco: parseFloat(preco),
        dataInicio: new Date(dataInicio),
        dataConclusao: new Date(dataConclusao),
        validadeProposta: validadeProposta ? new Date(validadeProposta) : null,
        descricaoAbordagem: descricaoAbordagem || null,
        observacoes: observacoes || null,
        status: 'PENDENTE',
      },
    })

    return NextResponse.json(proposta, { status: 201 })
  } catch (error) {
    console.error('[POST /api/propostas]', error)
    return NextResponse.json({ erro: 'Erro ao submeter proposta.' }, { status: 500 })
  }
}
