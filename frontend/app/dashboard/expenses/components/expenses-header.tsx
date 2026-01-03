import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExpensesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#101828] mb-1">
          Expenses
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Manage and track all your expenses
        </p>
      </div>
      <Link href="/dashboard/add-expense">
        <Button className="bg-linear-to-r from-[#F14926] to-[#e63e1b] hover:from-[#d93d1d] hover:to-[#c83212] text-white shadow-md hover:shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </Link>
    </div>
  );
}