'use client';

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { PieChartData } from '@/lib/types/analytics';

interface PieChartProps {
  data: PieChartData[];
  currency: string;
}

export default function PieChart({ data, currency }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-[#101828] mb-6">Spending by Category</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <ResponsiveContainer width="100%" height={400}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${((entry.value / total) * 100).toFixed(0)}%`}
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${currency} ${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#101828',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>

        <div className="space-y-3 max-h-100 overflow-y-auto pr-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-[#101828] truncate">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#101828]">{currency} {item.value.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}