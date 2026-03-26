import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    template: '%s | Veltra Business Solutions',
    default: 'Veltra Business Solutions — Marketplace B2B de Serviços Empresariais',
  },
  description:
    'Conectamos empresas com prestadores de serviços verificados. Limpeza técnica, contabilidade, IT e muito mais.',
  keywords: ['marketplace B2B', 'serviços empresariais', 'limpeza industrial', 'contabilidade empresarial'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
