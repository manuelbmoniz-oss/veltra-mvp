import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotificacaoFatura } from '@/lib/email'

// GET /api/faturas/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; prestadorId?: string }

  try {
    const fatura = await prisma.fatura.findUnique({
      where: { id: params.id },
      include: {
        pedido: { include: { empresaCliente: true } },
        proposta: true,
        prestador: { include: { empresa: true } },
        cliente: true,
        ratings: { select: { avaliadorId: true, tipo: true } },
      },
    })

    if (!fatura) return NextResponse.json({ erro: 'Fatura não encontrada.' }, { status: 404 })

    // Verifica acesso
    const isCliente = fatura.clienteId === user.empresaId
    const isPrestador = fatura.prestadorId === user.prestadorId

    if (!isCliente && !isPrestador) {
      return NextResponse.json({ erro: 'Sem permissão.' }, { status: 403 })
    }

    // Prestador não confirmado não acede ao ficheiro antes de o cliente confirmar
    const podeVerFicheiro = isCliente || fatura.confirmada

    return NextResponse.json({
      ...fatura,
      ficheiroUrl: podeVerFicheiro ? fatura.ficheiroUrl : null,
    })
  } catch (error) {
    console.error('[GET /api/faturas/:id]', error)
    return NextResponse.json({ erro: 'Erro.' }, { status: 500 })
  }
}

// PATCH /api/faturas/:id — carregar ou confirmar fatura
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; prestadorId?: string }

  try {
    const body = await req.json()
    const { acao, ficheiroUrl, numeroFatura, valor } = body

    const fatura = await prisma.fatura.findUnique({
      where: { id: params.id },
      include: {
        prestador: { include: { empresa: true } },
        cliente: true,
        pedido: true,
      },
    })

    if (!fatura) return NextResponse.json({ erro: 'Fatura não encontrada.' }, { status: 404 })

    const isCliente = fatura.clienteId === user.empresaId
    const isPrestador = fatura.prestadorId === user.prestadorId

    if (!isCliente && !isPrestador) {
      return NextResponse.json({ erro: 'Sem permissão.' }, { status: 403 })
    }

    if (acao === 'carregar') {
      // Qualquer das partes pode carregar a fatura
      const updated = await prisma.fatura.update({
        where: { id: params.id },
        data: {
          ficheiroUrl,
          numeroFatura: numeroFatura || fatura.numeroFatura,
          valor: valor ? parseFloat(valor) : fatura.valor,
          carregadaPor: isPrestador ? 'PRESTADOR' : 'CLIENTE',
        },
      })

      // Se o prestador carregou, notifica o cliente
      if (isPrestador) {
        try {
          await sendNotificacaoFatura(
            fatura.cliente.email,
            fatura.cliente.nome,
            fatura.pedido.titulo,
            fatura.prestador.empresa.nome
          )
        } catch (emailErr) {
          console.error('[fatura/carregar] Email error:', emailErr)
        }
      }

      return NextResponse.json(updated)
    }

    if (acao === 'confirmar') {
      // Só o cliente confirma a fatura
      if (!isCliente) {
        return NextResponse.json({ erro: 'Só o cliente pode confirmar a fatura.' }, { status: 403 })
      }
      if (!fatura.ficheiroUrl) {
        return NextResponse.json({ erro: 'Carregue a fatura primeiro.' }, { status: 400 })
      }

      const updated = await prisma.$transaction([
        prisma.fatura.update({
          where: { id: params.id },
          data: { confirmada: true, confirmadaEm: new Date() },
        }),
        prisma.pedido.update({
          where: { id: fatura.pedidoId },
          data: { status: 'CONCLUIDO' },
        }),
      ])

      return NextResponse.json(updated[0])
    }

    return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/faturas/:id]', error)
    return NextResponse.json({ erro: 'Erro ao processar fatura.' }, { status: 500 })
  }
}
