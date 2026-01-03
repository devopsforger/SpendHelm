import { Card } from '@/components/ui/card';
import { CategoryBreakdownItem } from '@/lib/types/analytics';

interface CategoryBreakdownProps {
  data: CategoryBreakdownItem[];
  currency: string;
  hasData: boolean;
}

export default function CategoryBreakdown({ data, currency, hasData }: CategoryBreakdownProps) {
  if (!hasData) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No expenses in this period</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-[#101828] mb-6">Category Breakdown</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Amount</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Percentage</th>
              <th className="text-right py-3 text-sm font-medium text-gray-500">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-[#101828]">{item.category}</span>
                  </div>
                </td>
                <td className="text-right py-3 font-semibold text-[#101828]">
                  {currency} {item.amount.toFixed(2)}
                </td>
                <td className="text-right py-3 text-gray-600">
                  {item.percentage.toFixed(1)}%
                </td>
                <td className="text-right py-3 text-gray-600">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}