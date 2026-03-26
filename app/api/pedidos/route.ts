import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { temRatingPendente } from '@/lib/rating'

// GET /api/pedidos — lista pedidos (filtrado por role)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; tipoEmpresa?: string; prestadorId?: string }
  const { searchParams } = req.nextUrl
  const categoria = searchParams.get('categoria')
  const status = searchParams.get('status')

  try {
    if (user.tipoEmpresa === 'CLIENTE') {
      // Cliente vê os seus próprios pedidos
      const pedidos = await prisma.pedido.findMany({
        where: {
          empresaClienteId: user.empresaId,
          ...(status ? { status: status as 'ABERTO' } : {}),
        },
        include: {
          _count: { select: { propostas: true } },
        },
        orderBy: { criadoEm: 'desc' },
      })
      return NextResponse.json(pedidos)
    } else {
      // Prestador vê pedidos abertos filtrados por categoria
      const prestador = await prisma.prestador.findUnique({
        where: { id: user.prestadorId },
        select: { categorias: true, raioKm: true },
      })

      const pedidos = await prisma.pedido.findMany({
        where: {
          status: 'ABERTO',
          ...(categoria
            ? { categoria: categoria as 'LIMPEZA' }
            : prestador?.categorias?.length
            ? { categoria: { in: prestador.categorias as 'LIMPEZA'[] } }
            : {}),
        },
        include: {
          empresaCliente: { select: { nome: true, morada: true } },
          _count: { select: { propostas: true } },
        },
        orderBy: { criadoEm: 'desc' },
      })
      return NextResponse.json(pedidos)
    }
  } catch (error) {
    console.error('[GET /api/pedidos]', error)
    return NextResponse.json({ erro: 'Erro ao buscar pedidos.' }, { status: 500 })
  }
}

// POST /api/pedidos — criar novo pedido
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 })

  const user = session.user as { empresaId?: string; tipoEmpresa?: string }

  if (user.tipoEmpresa === 'PRESTADOR') {
    return NextResponse.json({ erro: 'Prestadores não podem criar pedidos.' }, { status: 403 })
  }

  try {
    // Verifica se tem rating pendente
    const bloqueado = await temRatingPendente(user.empresaId!, 'CLIENTE')
    if (bloqueado) {
      return NextResponse.json(
        { erro: 'Tem uma avaliação pendente. Complete-a antes de publicar um novo pedido.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { titulo, descricao, categoria, localizacao } = body

    if (!titulo || !descricao || !categoria || !localizacao) {
      return NextResponse.json({ erro: 'Campos obrigatórios em falta.' }, { status: 400 })
    }

    const pedido = await prisma.pedido.create({
      data: {
        empresaClienteId: user.empresaId!,
        titulo,
        descricao,
        categoria,
        localizacao,
        status: 'ABERTO',
      },
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (error) {
    console.error('[POST /api/pedidos]', error)
    return NextResponse.json({ erro: 'Erro ao criar pedido.' }, { status: 500 })
  }
}
