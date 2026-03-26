import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=TokenInvalido', req.url))
  }

  try {
    const emailToken = await prisma.emailToken.findUnique({
      where: { token },
      include: { user: { include: { empresa: true } } },
    })

    if (!emailToken || emailToken.usado || emailToken.expires < new Date()) {
      return NextResponse.redirect(new URL('/login?error=TokenExpirado', req.url))
    }

    // Ativa a conta
    await prisma.$transaction([
      prisma.emailToken.update({
        where: { id: emailToken.id },
        data: { usado: true },
      }),
      prisma.empresa.update({
        where: { id: emailToken.user.empresaId! },
        data: { status: 'ATIVO' },
      }),
      prisma.user.update({
        where: { id: emailToken.userId },
        data: { emailVerified: new Date() },
      }),
    ])

    return NextResponse.redirect(new URL('/login?confirmado=1', req.url))
  } catch (error) {
    console.error('[verificar]', error)
    return NextResponse.redirect(new URL('/login?error=ErroInterno', req.url))
  }
}
