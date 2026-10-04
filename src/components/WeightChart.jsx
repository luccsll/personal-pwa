import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate, formatShortDate } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import './WeightChart.scss';

function ChartTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="weight-chart__tooltip">
      <span>{formatDate(point.date)}</span>
      <strong>
        {formatNumber(point.value)} {unit}
      </strong>
    </div>
  );
}

/**
 * Gráfico de linha simples para evolução de peso corporal ou de carga.
 * data: [{ date, value }]
 */
export default function WeightChart({ data, unit = 'kg', height = 220 }) {
  if (data.length < 2) {
    return (
      <div className="weight-chart weight-chart--empty" style={{ height }}>
        Registre pelo menos 2 valores para ver o gráfico.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(1, (max - min) * 0.2);

  return (
    <div className="weight-chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#E7EAF1" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fill: '#9AA3B5', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            domain={[Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)]}
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fill: '#9AA3B5', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#BFD8FF' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3478E8"
            strokeWidth={2}
            dot={{ r: 4, fill: '#FFFFFF', stroke: '#3478E8', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#3478E8', stroke: '#FFFFFF', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
