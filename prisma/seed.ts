/**
 * Seed para desenvolvimento local
 * Cria dados de demonstração: 2 clientes, 3 prestadores, pedidos e propostas
 * Correr com: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed da base de dados...')

  // Limpa dados existentes
  await prisma.$transaction([
    prisma.rating.deleteMany(),
    prisma.fatura.deleteMany(),
    prisma.proposta.deleteMany(),
    prisma.anexo.deleteMany(),
    prisma.pedido.deleteMany(),
    prisma.prestador.deleteMany(),
    prisma.emailToken.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
    prisma.empresa.deleteMany(),
  ])

  const senha = await bcrypt.hash('password123', 12)

  // ── Clientes ──────────────────────────────────────────────────────────────────

  const empresaCliente1 = await prisma.empresa.create({
    data: {
      nif: '500000001',
      nome: 'Indústrias Nortenhas, SA',
      cae: '28110',
      morada: 'Zona Industrial de Braga, Lote 3, 4700-000 Braga',
      email: 'cliente1@demo.veltra.pt',
      telefone: '+351 253 000 001',
      tipo: 'CLIENTE',
      status: 'ATIVO',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Indústrias Nortenhas, SA',
      email: 'cliente1@demo.veltra.pt',
      passwordHash: senha,
      emailVerified: new Date(),
      empresaId: empresaCliente1.id,
    },
  })

  const empresaCliente2 = await prisma.empresa.create({
    data: {
      nif: '500000002',
      nome: 'Escritórios Lisboa Centro, Lda',
      cae: '70100',
      morada: 'Av. da Liberdade, 50, 1250-001 Lisboa',
      email: 'cliente2@demo.veltra.pt',
      telefone: '+351 213 000 002',
      tipo: 'CLIENTE',
      status: 'ATIVO',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Escritórios Lisboa Centro, Lda',
      email: 'cliente2@demo.veltra.pt',
      passwordHash: senha,
      emailVerified: new Date(),
      empresaId: empresaCliente2.id,
    },
  })

  // ── Prestadores ───────────────────────────────────────────────────────────────

  const empresaPrestador1 = await prisma.empresa.create({
    data: {
      nif: '501000001',
      nome: 'LimpeTech Especializada, Lda',
      cae: '81210',
      morada: 'Rua das Flores, 200, 4050-260 Porto',
      email: 'prestador1@demo.veltra.pt',
      tipo: 'PRESTADOR',
      status: 'ATIVO',
    },
  })

  const prestador1 = await prisma.prestador.create({
    data: {
      empresaId: empresaPrestador1.id,
      categorias: ['LIMPEZA'],
      raioKm: null, // nacional
      ratingGlobal: 4.7,
      totalAvaliacoes: 23,
    },
  })

  await prisma.user.create({
    data: {
      name: 'LimpeTech Especializada, Lda',
      email: 'prestador1@demo.veltra.pt',
      passwordHash: senha,
      emailVerified: new Date(),
      empresaId: empresaPrestador1.id,
    },
  })

  const empresaPrestador2 = await prisma.empresa.create({
    data: {
      nif: '502000001',
      nome: 'ContaFácil & Associados',
      cae: '69200',
      morada: 'Rua do Carmo, 15, 1200-093 Lisboa',
      email: 'prestador2@demo.veltra.pt',
      tipo: 'PRESTADOR',
      status: 'ATIVO',
    },
  })

  const prestador2 = await prisma.prestador.create({
    data: {
      empresaId: empresaPrestador2.id,
      categorias: ['CONTABILIDADE'],
      raioKm: null,
      ratingGlobal: 4.9,
      totalAvaliacoes: 41,
    },
  })

  await prisma.user.create({
    data: {
      name: 'ContaFácil & Associados',
      email: 'prestador2@demo.veltra.pt',
      passwordHash: senha,
      emailVerified: new Date(),
      empresaId: empresaPrestador2.id,
    },
  })

  const empresaPrestador3 = await prisma.empresa.create({
    data: {
      nif: '501000002',
      nome: 'CleanPro Industrial Norte',
      cae: '81210',
      morada: 'Av. do Mar, 100, 4480-000 Vila do Conde',
      email: 'prestador3@demo.veltra.pt',
      tipo: 'PRESTADOR',
      status: 'ATIVO',
    },
  })

  const prestador3 = await prisma.prestador.create({
    data: {
      empresaId: empresaPrestador3.id,
      categorias: ['LIMPEZA'],
      raioKm: 80,
      ratingGlobal: null, // novo prestador
      totalAvaliacoes: 0,
    },
  })

  await prisma.user.create({
    data: {
      name: 'CleanPro Industrial Norte',
      email: 'prestador3@demo.veltra.pt',
      passwordHash: senha,
      emailVerified: new Date(),
      empresaId: empresaPrestador3.id,
    },
  })

  // ── Pedidos ───────────────────────────────────────────────────────────────────

  const pedido1 = await prisma.pedido.create({
    data: {
      empresaClienteId: empresaCliente1.id,
      categoria: 'LIMPEZA',
      titulo: 'Limpeza industrial pós-obra — Nave 2 (1200 m²)',
      descricao: 'Limpeza completa pós-obra de nave industrial com 1200 m². Inclui remoção de detritos de construção, limpeza de pavimentos epóxi, janelas e estrutura metálica. Acesso por portão industrial, disponível 2ª a 6ª das 7h às 18h.',
      localizacao: 'Braga — Zona Industrial',
      status: 'ABERTO',
    },
  })

  const pedido2 = await prisma.pedido.create({
    data: {
      empresaClienteId: empresaCliente2.id,
      categoria: 'CONTABILIDADE',
      titulo: 'Serviços de contabilidade organizada + IVA trimestral',
      descricao: 'Empresa de consultoria com 3 trabalhadores a necessitar de serviços de contabilidade organizada, processamento de salários, declarações de IVA trimestrais e IRC anual. Volume de faturação aproximado: 350k€/ano.',
      localizacao: 'Lisboa — Av. da Liberdade',
      status: 'ABERTO',
    },
  })

  const pedido3 = await prisma.pedido.create({
    data: {
      empresaClienteId: empresaCliente1.id,
      categoria: 'LIMPEZA',
      titulo: 'Manutenção mensal de espaços de escritório (500 m²)',
      descricao: 'Contrato mensal de limpeza para 3 pisos de escritórios open-space com copa e casas de banho. Limpeza diária das áreas comuns e profunda semanal. Horário preferencial: após as 19h.',
      localizacao: 'Braga — Centro',
      status: 'ABERTO',
    },
  })

  // ── Propostas ─────────────────────────────────────────────────────────────────

  await prisma.proposta.create({
    data: {
      pedidoId: pedido1.id,
      prestadorId: prestador1.id,
      preco: 2800,
      dataInicio: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      dataConclusao: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      validadeProposta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      descricaoAbordagem: 'Utilizamos equipamento industrial de alta pressão e detergentes certificados. Equipa de 4 técnicos especializados em limpeza pós-obra.',
      observacoes: 'Preço inclui todos os materiais e equipamentos. Garantia de satisfação: revisão gratuita se necessário.',
      status: 'PENDENTE',
    },
  })

  await prisma.proposta.create({
    data: {
      pedidoId: pedido1.id,
      prestadorId: prestador3.id,
      preco: 2200,
      dataInicio: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      dataConclusao: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      descricaoAbordagem: 'Empresa nova mas com equipa experiente. Utilizamos produtos ecológicos certificados.',
      status: 'PENDENTE',
    },
  })

  await prisma.proposta.create({
    data: {
      pedidoId: pedido2.id,
      prestadorId: prestador2.id,
      preco: 450,
      dataInicio: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      dataConclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      validadeProposta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      descricaoAbordagem: 'Contabilidade organizada completa com acesso a software online 24/7. Gestão de IVA, IRC, IES e processamento salarial incluídos.',
      observacoes: 'Valor mensal. Contrato mínimo de 12 meses.',
      status: 'PENDENTE',
    },
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log('')
  console.log('Contas de demo (password: password123):')
  console.log('  Cliente 1: cliente1@demo.veltra.pt')
  console.log('  Cliente 2: cliente2@demo.veltra.pt')
  console.log('  Prestador 1 (Limpeza, rating 4.7): prestador1@demo.veltra.pt')
  console.log('  Prestador 2 (Contabilidade, rating 4.9): prestador2@demo.veltra.pt')
  console.log('  Prestador 3 (Limpeza, Novo): prestador3@demo.veltra.pt')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
