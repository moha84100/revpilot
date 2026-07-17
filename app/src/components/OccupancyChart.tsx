import {
  Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from 'recharts'

interface ChartRow {
  date: string
  actuel: number
  precedent: number
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name} : {item.value} %</span>)}</div>
}

export default function OccupancyChart({ data }: { data: ChartRow[] }) {
  const interval = data.length <= 30 ? 4 : data.length <= 60 ? 8 : 14
  return <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: -22 }}>
      <defs>
        <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4774e6" stopOpacity={0.28} /><stop offset="100%" stopColor="#4774e6" stopOpacity={0.02} /></linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e8ebf1" />
      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8490a3' }} axisLine={false} tickLine={false} interval={interval} />
      <YAxis domain={[0, (max: number) => Math.max(110, Math.ceil(max / 10) * 10)]} tick={{ fontSize: 10, fill: '#8490a3' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
      <Tooltip content={<ChartTooltip />} />
      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, paddingTop: 12 }} />
      <Area name="Cette année" type="monotone" dataKey="actuel" stroke="#3867d6" strokeWidth={2.5} fill="url(#occupancyFill)" activeDot={{ r: 5 }} />
      <Line name="Année précédente" type="monotone" dataKey="precedent" stroke="#adb7c8" strokeWidth={1.7} strokeDasharray="5 4" dot={false} />
    </AreaChart>
  </ResponsiveContainer>
}
