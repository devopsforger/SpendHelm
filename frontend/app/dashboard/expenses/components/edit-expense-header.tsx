'use client';

import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditExpenseHeaderProps {
  onBack: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function EditExpenseHeader({
  onBack,
  onDelete,
  isDeleting
}: EditExpenseHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-[#101828]">
          Edit Expense
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={isDeleting}
        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}