import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'

const SEGMENTOS = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    titulo: 'Limpeza Técnica',
    descricao: 'Limpeza industrial, limpeza pós-obra, manutenção de instalações e espaços técnicos.',
    cor: 'bg-blue-50 text-veltra-dark border-blue-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    titulo: 'Contabilidade & Gestão Fiscal',
    descricao: 'Contabilidade organizada, IES, IRC, IVA, payroll e apoio à gestão empresarial.',
    cor: 'bg-green-50 text-green-800 border-green-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    titulo: 'Em breve: IT & RH',
    descricao: 'Suporte informático, gestão de recursos humanos, marketing digital e muito mais.',
    cor: 'bg-gray-50 text-gray-500 border-gray-100',
  },
]

const COMO_FUNCIONA = [
  {
    step: '01',
    titulo: 'Registe a sua empresa',
    descricao: 'Validação por NIF. Rápido, seguro e sem burocracia.',
  },
  {
    step: '02',
    titulo: 'Publique um pedido',
    descricao: 'Descreva o serviço que precisa. Os prestadores verificados recebem o pedido.',
  },
  {
    step: '03',
    titulo: 'Escolha a melhor proposta',
    descricao: 'Compare preços, ratings e prazos. Adjudique com um clique.',
  },
  {
    step: '04',
    titulo: 'Conclua com confiança',
    descricao: 'Ciclo de fatura e avaliação mútua que garante qualidade contínua.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-veltra-dark via-veltra-dark to-veltra-medium text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-veltra-medium/30 border border-veltra-medium/50 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-sm text-veltra-light">Marketplace B2B em Portugal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Serviços empresariais{' '}
              <span className="text-veltra-light">verificados</span>,<br />
              a um clique de distância
            </h1>
            <p className="text-lg text-veltra-light/90 mb-10 leading-relaxed max-w-2xl">
              A Veltra conecta empresas clientes com prestadores de serviços certificados.
              Publique pedidos, receba propostas comparáveis e adjudique com total transparência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/registo?tipo=cliente">
                <Button size="lg" className="bg-white text-veltra-dark hover:bg-veltra-light w-full sm:w-auto">
                  Preciso de Serviços
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
              <Link href="/registo?tipo=prestador">
                <Button size="lg" variant="outline" className="border-veltra-light/60 text-white hover:bg-veltra-medium/20 w-full sm:w-auto">
                  Sou Prestador de Serviços
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="bg-veltra-medium text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-veltra-light/30 text-center">
            {[
              { label: 'Verificação por NIF', value: '100%' },
              { label: 'Avaliação multi-dimensão', value: '3 Critérios' },
              { label: 'Segmentos disponíveis', value: '2+' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-veltra-light/80 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segmentos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-veltra-dark mb-4">Categorias de Serviço</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Começamos por limpeza técnica e contabilidade, com novos segmentos a caminho.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SEGMENTOS.map((seg) => (
              <div
                key={seg.titulo}
                className={`border rounded-2xl p-6 ${seg.cor}`}
              >
                <div className="mb-4">{seg.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{seg.titulo}</h3>
                <p className="text-sm leading-relaxed opacity-80">{seg.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-veltra-dark mb-4">Como Funciona</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Da publicação do pedido à avaliação final, num processo simples e transparente.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {COMO_FUNCIONA.map((item, i) => (
              <div key={item.step} className="relative">
                {i < COMO_FUNCIONA.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-veltra-light z-0 -translate-x-4" />
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-veltra-dark text-white flex items-center justify-center font-bold text-sm mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.titulo}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-veltra-dark text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-veltra-light/80 mb-8 text-lg">
            Registe a sua empresa em menos de 5 minutos. Validação de NIF incluída.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registo?tipo=cliente">
              <Button size="lg" className="bg-white text-veltra-dark hover:bg-veltra-light w-full sm:w-auto">
                Registar como Cliente
              </Button>
            </Link>
            <Link href="/registo?tipo=prestador">
              <Button size="lg" variant="outline" className="border-veltra-light/60 text-white hover:bg-veltra-medium/20 w-full sm:w-auto">
                Registar como Prestador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Veltra</span>
              <span className="text-xs">Business Solutions</span>
            </div>
            <p className="text-xs">
              © {new Date().getFullYear()} Veltra Business Solutions. MVP — Versão de Desenvolvimento.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
