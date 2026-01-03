'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartDataPoint } from '@/lib/types/analytics';

interface BarChartProps {
  data: ChartDataPoint[];
  currency: string;
}

export default function BarChart({ data, currency }: BarChartProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-[#101828] mb-6">Daily Spending - Last 7 Days</h2>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
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
          <Bar
            dataKey="amount"
            fill="url(#colorGradient)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#551931" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#7a2547" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  );
}