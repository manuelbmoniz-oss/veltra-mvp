import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNotificacaoAdjudicacao } from '@/lib/email'

// PATCH /api/propostas/:id — adjudicar proposta
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string }

  try {
    const { acao } = await req.json() // acao: 'adjudicar' | 'rejeitar'

    const proposta = await prisma.proposta.findUnique({
      where: { id: params.id },
      include: {
        pedido: { include: { empresaCliente: true } },
        prestador: { include: { empresa: true } },
      },
    })

    if (!proposta) return NextResponse.json({ erro: 'Proposta não encontrada.' }, { status: 404 })

    // Só o cliente dono do pedido pode adjudicar
    if (proposta.pedido.empresaClienteId !== user.empresaId) {
      return NextResponse.json({ erro: 'Sem permissão.' }, { status: 403 })
    }

    if (proposta.pedido.status !== 'ABERTO') {
      return NextResponse.json({ erro: 'O pedido já não está aberto.' }, { status: 409 })
    }

    if (acao === 'adjudicar') {
      // Transação: adjudicar proposta + fechar pedido + rejeitar outras propostas
      await prisma.$transaction([
        prisma.proposta.update({
          where: { id: params.id },
          data: { status: 'ADJUDICADA' },
        }),
        prisma.pedido.update({
          where: { id: proposta.pedidoId },
          data: { status: 'ADJUDICADO' },
        }),
        // Rejeita todas as outras propostas pendentes do mesmo pedido
        prisma.proposta.updateMany({
          where: {
            pedidoId: proposta.pedidoId,
            id: { not: params.id },
            status: 'PENDENTE',
          },
          data: { status: 'REJEITADA' },
        }),
        // Cria registo de fatura em branco para este serviço
        prisma.fatura.create({
          data: {
            pedidoId: proposta.pedidoId,
            propostaId: proposta.id,
            prestadorId: proposta.prestadorId,
            clienteId: user.empresaId!,
            numeroFatura: `VLT-${Date.now()}`,
            valor: proposta.preco,
          },
        }),
      ])

      // Notifica o prestador
      try {
        await sendNotificacaoAdjudicacao(
          proposta.prestador.empresa.email,
          proposta.prestador.empresa.nome,
          proposta.pedido.titulo,
          proposta.pedidoId
        )
      } catch (emailErr) {
        console.error('[adjudicar] Erro ao enviar email:', emailErr)
      }

      return NextResponse.json({ ok: true, mensagem: 'Proposta adjudicada com sucesso.' })
    }

    return NextResponse.json({ erro: 'Ação inválida.' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/propostas/:id]', error)
    return NextResponse.json({ erro: 'Erro ao processar proposta.' }, { status: 500 })
  }
}
