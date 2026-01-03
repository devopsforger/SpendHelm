'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddExpenseHeaderProps {
  onBack: () => void;
}

export default function AddExpenseHeader({ onBack }: AddExpenseHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#101828]">
          Add Expense
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Record a new expense
        </p>
      </div>
    </div>
  );
}