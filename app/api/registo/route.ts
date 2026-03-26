export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmailConfirmacao } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nif, nome, cae, morada, email, telefone, password, tipo, categorias, raioKm } = body

    // Validações básicas
    if (!nif || !nome || !email || !password || !tipo) {
      return NextResponse.json({ erro: 'Campos obrigatórios em falta.' }, { status: 400 })
    }

    // Verifica duplicados
    const [emailExiste, nifExiste] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.empresa.findUnique({ where: { nif } }),
    ])

    if (emailExiste) {
      return NextResponse.json({ erro: 'Este email já está registado.' }, { status: 409 })
    }
    if (nifExiste) {
      return NextResponse.json({ erro: 'Este NIF já está registado.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Cria empresa, user e prestador (se aplicável) numa transação
    const resultado = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nif,
          nome,
          cae,
          morada,
          email,
          telefone,
          tipo,
          status: 'PENDENTE',
        },
      })

      const user = await tx.user.create({
        data: {
          name: nome,
          email,
          passwordHash,
          empresaId: empresa.id,
        },
      })

      // Cria perfil de prestador se aplicável
      if (tipo === 'PRESTADOR' || tipo === 'AMBOS') {
        await tx.prestador.create({
          data: {
            empresaId: empresa.id,
            categorias: categorias || [],
            raioKm: raioKm || null,
          },
        })
      }

      // Gera token de verificação de email (válido 24h)
      const token = crypto.randomBytes(32).toString('hex')
      await tx.emailToken.create({
        data: {
          token,
          userId: user.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })

      return { userId: user.id, token }
    })

    // Envia email de confirmação
    try {
      await sendEmailConfirmacao(email, nome, resultado.token)
    } catch (emailErr) {
      console.error('[registo] Erro ao enviar email:', emailErr)
      // Não bloqueia o registo se o email falhar em dev
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('[registo]', error)
    return NextResponse.json({ erro: 'Erro interno ao criar conta.' }, { status: 500 })
  }
}
