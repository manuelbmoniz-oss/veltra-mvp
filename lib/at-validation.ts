/**
 * Mock da API da AT (Autoridade Tributária) para validação de NIF.
 * No MVP, simula respostas realistas para desenvolvimento.
 * Em produção, substituir por chamada real à API da AT ou Informações Empresariais.
 */

export interface ATEmpresaData {
  nif: string
  nome: string
  cae: string
  caeDescricao: string
  morada: string
  valido: boolean
  erro?: string
}

// Base de dados fictícia de NIFs para demo
const NIFS_MOCK: Record<string, Omit<ATEmpresaData, 'nif' | 'valido'>> = {
  '500000000': {
    nome: 'Tech Solutions Lda',
    cae: '62010',
    caeDescricao: 'Programação Informática',
    morada: 'Rua de Santa Catarina, 100, 4000-450 Porto',
  },
  '501000000': {
    nome: 'Limpezas Cristal Unipessoal Lda',
    cae: '81210',
    caeDescricao: 'Limpeza Geral de Edifícios',
    morada: 'Avenida da Liberdade, 200, 1250-096 Lisboa',
  },
  '502000000': {
    nome: 'Contabilidade & Gestão, Lda',
    cae: '69200',
    caeDescricao: 'Atividades de Contabilidade e Auditoria',
    morada: 'Rua do Ouro, 50, 1100-060 Lisboa',
  },
  '503000000': {
    nome: 'Industrias Metalúrgicas do Norte, SA',
    cae: '25110',
    caeDescricao: 'Fabricação de Estruturas de Construção Metálicas',
    morada: 'Zona Industrial de Maia, Lote 15, 4470-177 Maia',
  },
}

function validarFormatoNIF(nif: string): boolean {
  if (!/^\d{9}$/.test(nif)) return false
  const primeiroDigito = parseInt(nif[0])
  // NIFs de pessoas coletivas começam em 5, 6, 8
  // NIFs de pessoas singulares começam em 1, 2, 3, 4
  if (![1, 2, 3, 4, 5, 6, 8].includes(primeiroDigito)) return false

  const digits = nif.split('').map(Number)
  const checksum =
    digits[0] * 9 +
    digits[1] * 8 +
    digits[2] * 7 +
    digits[3] * 6 +
    digits[4] * 5 +
    digits[5] * 4 +
    digits[6] * 3 +
    digits[7] * 2

  const resto = checksum % 11
  const digitoControle = resto < 2 ? 0 : 11 - resto
  return digitoControle === digits[8]
}

export async function simulateATValidation(nif: string): Promise<ATEmpresaData> {
  // Simula latência de rede
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (!validarFormatoNIF(nif)) {
    return {
      nif,
      nome: '',
      cae: '',
      caeDescricao: '',
      morada: '',
      valido: false,
      erro: 'NIF inválido. Verifique o número introduzido.',
    }
  }

  // Verifica na base de dados mock
  if (NIFS_MOCK[nif]) {
    return {
      nif,
      ...NIFS_MOCK[nif],
      valido: true,
    }
  }

  // Para NIFs válidos mas não na base mock, gera dados genéricos
  const nomes = [
    'Empresa Comercial',
    'Serviços Integrados',
    'Gestão e Consultoria',
    'Soluções Empresariais',
  ]
  const caes = [
    { code: '46900', desc: 'Comércio por Grosso Não Especializado' },
    { code: '70220', desc: 'Outras Atividades de Consultoria para os Negócios' },
    { code: '82990', desc: 'Outras Atividades de Serviços de Apoio às Empresas' },
  ]
  const cidades = ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro']

  const idx = parseInt(nif.slice(-2)) % nomes.length
  const caeIdx = parseInt(nif.slice(-1)) % caes.length
  const cidadeIdx = parseInt(nif[1]) % cidades.length

  return {
    nif,
    nome: `${nomes[idx]}, Lda`,
    cae: caes[caeIdx].code,
    caeDescricao: caes[caeIdx].desc,
    morada: `Rua Exemplo, ${parseInt(nif.slice(3, 6))}, ${cidades[cidadeIdx]}`,
    valido: true,
  }
}
