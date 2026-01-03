'use client';

import { BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BarChart from './bar-chart';
import PieChart from './pie-chart';
import LineChart from './line-chart';
import { ChartDataPoint, PieChartData } from '@/lib/types/analytics';

interface ChartTabsProps {
  chartType: 'bar' | 'pie' | 'line';
  onChartTypeChange: (type: 'bar' | 'pie' | 'line') => void;
  barData: ChartDataPoint[];
  pieData: PieChartData[];
  lineData: ChartDataPoint[];
  currency: string;
  hasData: boolean;
}

export default function ChartTabs({
  chartType,
  onChartTypeChange,
  barData,
  pieData,
  lineData,
  currency,
  hasData
}: ChartTabsProps) {
  if (!hasData) {
    return (
      <Card className="p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[#101828] mb-2">No Data Available</h3>
        <p className="text-gray-500">Record some expenses to see analytics</p>
      </Card>
    );
  }

  return (
    <Tabs value={chartType} onValueChange={onChartTypeChange}>
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="bar" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Bar
        </TabsTrigger>
        <TabsTrigger value="pie" className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4" />
          Pie
        </TabsTrigger>
        <TabsTrigger value="line" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Line
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bar">
        <BarChart data={barData} currency={currency} />
      </TabsContent>

      <TabsContent value="pie">
        <PieChart data={pieData} currency={currency} />
      </TabsContent>

      <TabsContent value="line">
        <LineChart data={lineData} currency={currency} />
      </TabsContent>
    </Tabs>
  );
}