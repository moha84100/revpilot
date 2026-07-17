export const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
}).format(value)

export const formatPercent = (value: number) => `${Math.round(value * 100)} %`

export const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('fr-FR', options ?? {
  weekday: 'short', day: 'numeric', month: 'short',
}).format(new Date(`${value}T12:00:00`))
