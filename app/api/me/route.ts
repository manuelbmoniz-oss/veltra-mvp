import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json(null, { status: 401 })
  }
  return NextResponse.json({
    id: (session.user as { id?: string }).id,
    email: session.user?.email,
    name: session.user?.name,
    empresaId: (session.user as { empresaId?: string }).empresaId,
    tipoEmpresa: (session.user as { tipoEmpresa?: string }).tipoEmpresa,
    prestadorId: (session.user as { prestadorId?: string }).prestadorId,
  })
}
