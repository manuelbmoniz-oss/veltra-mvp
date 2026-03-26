export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/pedidos/:id — detalhe do pedido com propostas
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; tipoEmpresa?: string; prestadorId?: string }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: {
        empresaCliente: { select: { id: true, nome: true, morada: true, nif: true } },
        anexos: true,
        _count: { select: { propostas: true } },
        propostas: {
          include: {
            prestador: {
              include: {
                empresa: { select: { nome: true, morada: true, nif: true } },
              },
            },
          },
          orderBy: { criadoEm: 'desc' },
        },
      },
    })

    if (!pedido) return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 })

    // Verifica acesso: cliente dono ou prestador
    const isCliente = pedido.empresaClienteId === user.empresaId
    const isPrestador = user.tipoEmpresa === 'PRESTADOR' || user.tipoEmpresa === 'AMBOS'

    if (!isCliente && !isPrestador) {
      return NextResponse.json({ erro: 'Sem permissão.' }, { status: 403 })
    }

    // Se for prestador, esconde propostas de outros prestadores
    if (!isCliente && isPrestador) {
      const pedidoFiltrado = {
        ...pedido,
        propostas: pedido.propostas.filter((p) => p.prestadorId === user.prestadorId),
      }
      return NextResponse.json(pedidoFiltrado)
    }

    return NextResponse.json(pedido)
  } catch (error) {
    console.error('[GET /api/pedidos/:id]', error)
    return NextResponse.json({ erro: 'Erro ao buscar pedido.' }, { status: 500 })
  }
}

// PATCH /api/pedidos/:id — cancelar pedido
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string }

  try {
    const body = await req.json()
    const { status } = body

    const pedido = await prisma.pedido.findUnique({ where: { id: params.id } })
    if (!pedido) return NextResponse.json({ erro: 'Pedido não encontrado.' }, { status: 404 })
    if (pedido.empresaClienteId !== user.empresaId) {
      return NextResponse.json({ erro: 'Sem permissão.' }, { status: 403 })
    }

    const updated = await prisma.pedido.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/pedidos/:id]', error)
    return NextResponse.json({ erro: 'Erro ao actualizar pedido.' }, { status: 500 })
  }
}
