import { prisma } from './prisma'

/**
 * Recalcula e actualiza o rating global de um prestador.
 * Regra: últimas 20 avaliações OU últimos 12 meses (o que for maior).
 * Pesos: qualidade 33,33% | prazos 33,33% | fidelidade orçamental 33,33%
 */
export async function recalcularRatingPrestador(prestadorId: string) {
  const empresa = await prisma.prestador.findUnique({
    where: { id: prestadorId },
    select: { empresaId: true },
  })
  if (!empresa) return

  const dozeAtras = new Date()
  dozeAtras.setMonth(dozeAtras.getMonth() - 12)

  // Busca ratings das últimas 20 ou últimos 12 meses
  const [ultimas20, ultimos12meses] = await Promise.all([
    prisma.rating.findMany({
      where: { avaliadoId: empresa.empresaId, tipo: 'CLIENTE_AVALIA_PRESTADOR' },
      orderBy: { criadoEm: 'desc' },
      take: 20,
    }),
    prisma.rating.findMany({
      where: {
        avaliadoId: empresa.empresaId,
        tipo: 'CLIENTE_AVALIA_PRESTADOR',
        criadoEm: { gte: dozeAtras },
      },
    }),
  ])

  // Usa o conjunto maior
  const ratings = ultimos12meses.length > ultimas20.length ? ultimos12meses : ultimas20

  if (ratings.length === 0) {
    await prisma.prestador.update({
      where: { id: prestadorId },
      data: { ratingGlobal: null, totalAvaliacoes: 0 },
    })
    return
  }

  const media =
    ratings.reduce((acc, r) => {
      const q = r.qualidade ?? 0
      const p = r.prazos ?? 0
      const f = r.fidelidadeOrcamental ?? 0
      return acc + (q * 1 + p * 1 + f * 1) / 3
    }, 0) / ratings.length

  await prisma.prestador.update({
    where: { id: prestadorId },
    data: {
      ratingGlobal: Math.round(media * 100) / 100,
      totalAvaliacoes: await prisma.rating.count({
        where: { avaliadoId: empresa.empresaId, tipo: 'CLIENTE_AVALIA_PRESTADOR' },
      }),
    },
  })
}

/** Verifica se uma empresa tem ratings pendentes que bloqueiam novas acções */
export async function temRatingPendente(empresaId: string, tipo: 'CLIENTE' | 'PRESTADOR') {
  if (tipo === 'CLIENTE') {
    // Cliente só pode publicar novos pedidos após avaliar prestador anterior
    const faturasPorConfirmar = await prisma.fatura.findFirst({
      where: {
        clienteId: empresaId,
        confirmada: true,
        ratings: {
          none: { avaliadorId: empresaId, tipo: 'CLIENTE_AVALIA_PRESTADOR' },
        },
      },
    })
    return !!faturasPorConfirmar
  } else {
    // Prestador só pode responder após avaliar cliente anterior
    const faturasPorAvaliar = await prisma.fatura.findFirst({
      where: {
        prestador: { empresaId },
        confirmada: true,
        ratings: {
          none: { avaliadorId: empresaId, tipo: 'PRESTADOR_AVALIA_CLIENTE' },
        },
      },
    })
    return !!faturasPorAvaliar
  }
}
