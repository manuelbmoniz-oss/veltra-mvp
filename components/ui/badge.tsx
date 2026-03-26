interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
}

const variantClasses = {
  default: 'bg-veltra-light text-veltra-dark',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  )
}

export function StatusPedidoBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ABERTO: { label: 'Aberto', variant: 'success' },
    ADJUDICADO: { label: 'Adjudicado', variant: 'info' },
    CONCLUIDO: { label: 'Concluído', variant: 'neutral' },
    CANCELADO: { label: 'Cancelado', variant: 'danger' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'neutral' }
  return <Badge variant={variant}>{label}</Badge>
}

export function StatusPropostaBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PENDENTE: { label: 'Pendente', variant: 'warning' },
    ADJUDICADA: { label: 'Adjudicada', variant: 'success' },
    REJEITADA: { label: 'Rejeitada', variant: 'danger' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'neutral' }
  return <Badge variant={variant}>{label}</Badge>
}

export function CategoriaBadge({ categoria }: { categoria: string }) {
  const map: Record<string, string> = {
    LIMPEZA: 'Limpeza',
    CONTABILIDADE: 'Contabilidade',
    IT: 'IT',
    RH: 'RH',
    MARKETING: 'Marketing',
  }
  return <Badge variant="default">{map[categoria] ?? categoria}</Badge>
}
