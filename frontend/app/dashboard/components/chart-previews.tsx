'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { ArrowRight, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { ChartData, PieChartData } from '@/lib/types/dashboard';

interface ChartPreviewsProps {
  chartData: ChartData[];
  pieData: PieChartData[];
  currency: string;
}

export default function ChartPreviews({ chartData, pieData, currency }: ChartPreviewsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Bar Chart Preview */}
      <Link href="/dashboard/analytics">
        <Card className="p-6 bg-white border border-gray-200 hover:border-[#551931]/30 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#551931]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#101828]">Daily Trend</h3>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#551931] transition-colors" />
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
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
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Link>

      {/* Pie Chart Preview */}
      <Link href="/dashboard/analytics">
        <Card className="p-6 bg-white border border-gray-200 hover:border-[#551931]/30 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-[#551931]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#101828]">By Category</h3>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#551931] transition-colors" />
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-sm text-gray-400">
              No data
            </div>
          )}
        </Card>
      </Link>

      {/* Top Categories */}
      <Link href="/dashboard/analytics">
        <Card className="p-6 bg-white border border-gray-200 hover:border-[#551931]/30 hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#551931]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#101828]">Top Spending</h3>
                <p className="text-xs text-gray-500">This month</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#551931] transition-colors" />
          </div>
          {pieData.length > 0 ? (
            <div className="space-y-2">
              {pieData.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-[#101828]">
                    {currency} {item.value.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[100px] flex items-center justify-center text-sm text-gray-400">
              No data
            </div>
          )}
        </Card>
      </Link>
    </div>
  );
}