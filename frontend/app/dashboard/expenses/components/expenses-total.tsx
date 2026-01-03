import { Card } from '@/components/ui/card';

interface ExpensesTotalProps {
  count: number;
  total: number;
}

export default function ExpensesTotal({ count, total }: ExpensesTotalProps) {
  return (
    <Card className="p-4 bg-linear-to-r from-[#551931]/5 to-[#7a2547]/5 border border-[#551931]/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#551931]">
          {count} expense{count !== 1 ? 's' : ''}
        </span>
        <span className="text-lg font-semibold text-[#551931]">
          Total: USD {total.toFixed(2)}
        </span>
      </div>
    </Card>
  );
}