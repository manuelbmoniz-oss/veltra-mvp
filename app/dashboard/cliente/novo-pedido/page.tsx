'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'

const CATEGORIAS = [
  { value: '', label: 'Selecione uma categoria...' },
  { value: 'LIMPEZA', label: 'Limpeza Técnica Especializada' },
  { value: 'CONTABILIDADE', label: 'Contabilidade & Gestão Fiscal' },
  { value: 'IT', label: 'Tecnologias de Informação' },
  { value: 'RH', label: 'Recursos Humanos' },
  { value: 'MARKETING', label: 'Marketing & Comunicação' },
]

export default function NovoPedidoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [localizacao, setLocalizacao] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!categoria) {
      setErro('Selecione uma categoria.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao, categoria, localizacao }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErro(data.erro || 'Erro ao publicar pedido.')
        return
      }

      router.push('/dashboard/cliente')
    } catch {
      setErro('Erro de ligação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard/cliente" className="hover:text-veltra-dark transition-colors">
            Dashboard
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">Novo Pedido</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Publicar Pedido</h1>
            <p className="text-gray-500 text-sm mt-1">
              Descreva o serviço que precisa. Prestadores verificados irão submeter propostas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Categoria de serviço"
              options={CATEGORIAS}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            />

            <Input
              label="Título do pedido"
              placeholder="ex: Limpeza industrial de armazém — 500m²"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              maxLength={120}
              hint="Seja específico. Bons títulos atraem melhores propostas."
            />

            <Textarea
              label="Descrição detalhada"
              placeholder={`Descreva o serviço com o máximo de detalhe:\n• Dimensões ou volume de trabalho\n• Requisitos específicos\n• Materiais ou equipamentos necessários\n• Condicionantes de acesso ou horário`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={6}
            />

            <Input
              label="Localização"
              placeholder="ex: Lisboa — Av. da República, 100"
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              required
              hint="Cidade e morada aproximada (não é necessário endereço exato)"
            />

            {/* Dica */}
            <div className="bg-veltra-lighter border border-veltra-light rounded-xl p-4">
              <p className="text-sm font-medium text-veltra-dark mb-1">Dicas para receber melhores propostas</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Inclua a dimensão exata do espaço ou volume de trabalho</li>
                <li>• Mencione prazos ou datas preferidas</li>
                <li>• Especifique requisitos obrigatórios (certificações, seguros, etc.)</li>
                <li>• Indique se tem preferência por empresas locais</li>
              </ul>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/dashboard/cliente" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" loading={loading} className="flex-[2]" size="lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Publicar Pedido
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
