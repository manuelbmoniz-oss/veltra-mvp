'use client'

interface StarRatingProps {
  value: number | null
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
  label?: string
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export function StarRating({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  label,
}: StarRatingProps) {
  if (value === null) {
    return (
      <span className="text-xs text-gray-400 italic">Novo na Plataforma</span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-xs text-gray-600 mr-1">{label}</span>}
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value)
          const partial = !filled && i < value
          return (
            <button
              key={i}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
              className={interactive ? 'cursor-pointer focus:outline-none' : 'cursor-default'}
            >
              <svg
                className={`${sizeMap[size]} ${
                  filled
                    ? 'text-amber-400'
                    : partial
                    ? 'text-amber-300'
                    : 'text-gray-200'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {partial ? (
                  <>
                    <defs>
                      <linearGradient id={`partial-${i}`}>
                        <stop offset={`${(value - Math.floor(value)) * 100}%`} stopColor="currentColor" />
                        <stop offset={`${(value - Math.floor(value)) * 100}%`} stopColor="#E5E7EB" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#partial-${i})`}
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </>
                ) : (
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                )}
              </svg>
            </button>
          )
        })}
      </div>
      {value !== null && (
        <span className="text-xs text-gray-500 ml-1">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

interface RatingDimensoesProps {
  qualidade: number | null
  prazos: number | null
  fidelidadeOrcamental: number | null
  compact?: boolean
}

export function RatingDimensoes({ qualidade, prazos, fidelidadeOrcamental, compact = false }: RatingDimensoesProps) {
  const dimensoes = [
    { label: 'Qualidade', value: qualidade },
    { label: 'Prazos', value: prazos },
    { label: 'Fidelidade Orç.', value: fidelidadeOrcamental },
  ]

  if (compact) {
    return (
      <div className="flex gap-3 flex-wrap">
        {dimensoes.map((d) => (
          <div key={d.label} className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{d.label}:</span>
            {d.value !== null ? (
              <StarRating value={d.value} size="sm" />
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {dimensoes.map((d) => (
        <div key={d.label} className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{d.label}</span>
          <StarRating value={d.value} size="sm" />
        </div>
      ))}
    </div>
  )
}
