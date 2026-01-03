import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { analyticsUtils } from '@/lib/utils/analytics';

interface AnalyticsTotalProps {
  period: 'week' | 'month' | 'all';
  total: number;
  currency: string;
}

export default function AnalyticsTotal({ period, total, currency }: AnalyticsTotalProps) {
  const periodLabel = analyticsUtils.getPeriodLabel(period);

  return (
    <Card className="p-6 bg-gradient-to-r from-[#551931]/5 to-[#7a2547]/5 border border-[#551931]/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#551931] font-medium mb-1">
            Total Spending ({periodLabel})
          </p>
          <p className="text-2xl sm:text-3xl font-semibold text-[#551931]">
            {currency} {total.toFixed(2)}
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center shadow-sm">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}