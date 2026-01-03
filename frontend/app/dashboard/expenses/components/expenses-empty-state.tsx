import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState() {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center">
          <Receipt className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-gray-500 mb-4">No expenses found.</p>
      <Link href="/dashboard/add-expense">
        <Button className="bg-linear-to-r from-[#551931] to-[#7a2547] hover:from-[#6b2040] hover:to-[#8a2c52] text-white shadow-md hover:shadow-lg">
          Add Expense
        </Button>
      </Link>
    </div>
  );
}