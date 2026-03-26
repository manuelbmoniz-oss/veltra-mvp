import { NextRequest, NextResponse } from 'next/server'
import { simulateATValidation } from '@/lib/at-validation'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { nif } = await req.json()

    if (!nif || typeof nif !== 'string') {
      return NextResponse.json({ valido: false, erro: 'NIF inválido.' }, { status: 400 })
    }

    const atData = await simulateATValidation(nif)

    if (!atData.valido) {
      return NextResponse.json({ valido: false, erro: atData.erro })
    }

    // Verifica se o NIF já está registado
    const empresaExistente = await prisma.empresa.findUnique({ where: { nif } })

    return NextResponse.json({
      valido: true,
      jaRegistado: !!empresaExistente,
      nome: atData.nome,
      cae: atData.cae,
      caeDescricao: atData.caeDescricao,
      morada: atData.morada,
    })
  } catch (error) {
    console.error('[validar-nif]', error)
    return NextResponse.json({ valido: false, erro: 'Erro interno.' }, { status: 500 })
  }
}
