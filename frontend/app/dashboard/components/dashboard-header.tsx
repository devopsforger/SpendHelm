import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  date: Date;
}

export default function DashboardHeader({ date }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-[#101828] mb-1">Dashboard</h1>
        <p className="text-gray-500">{format(date, 'EEEE, MMMM d, yyyy')}</p>
      </div>
      <Link href="/dashboard/add-expense">
        <Button className="bg-linear-to-r from-[#F14926] to-[#e63e1b] hover:from-[#d93d1d] hover:to-[#c83212] text-white shadow-md hover:shadow-lg transition-all">
          Add Expense
        </Button>
      </Link>
    </div>
  );
}