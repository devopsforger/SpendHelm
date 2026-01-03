import { Card } from '@/components/ui/card';
import { Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface AggregateCardsProps {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  currency: string;
}

export default function AggregateCards({
  todayTotal,
  weekTotal,
  monthTotal,
  currency
}: AggregateCardsProps) {
  const aggregates = [
    { label: 'Today', amount: todayTotal, icon: Calendar },
    { label: 'This Week', amount: weekTotal, icon: TrendingUp },
    { label: 'This Month', amount: monthTotal, icon: DollarSign },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {aggregates.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#551931]" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{item.label}</p>
            <p className="text-3xl font-semibold text-[#101828]">
              {currency} {item.amount.toFixed(2)}
            </p>
          </Card>
        );
      })}
    </div>
  );
}