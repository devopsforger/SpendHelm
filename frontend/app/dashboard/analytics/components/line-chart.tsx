'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/lib/types/analytics';

interface LineChartProps {
  data: ChartDataPoint[];
  currency: string;
}

export default function LineChart({ data, currency }: LineChartProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-[#101828] mb-6">Spending Trend</h2>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${currency} ${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`${currency} ${value.toFixed(2)}`, 'Amount']}
            contentStyle={{
              backgroundColor: '#101828',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '12px'
            }}
            labelStyle={{ color: '#d1d5db' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="url(#lineGradient)"
            strokeWidth={2}
            dot={{ fill: '#551931', r: 4 }}
            activeDot={{ r: 6, fill: '#551931' }}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#551931" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#7a2547" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </RechartsLineChart>
      </ResponsiveContainer>
    </Card>
  );
}