'use client';

import { Card } from '@/components/ui/card';
import ExpenseForm from '@/components/expenses/expense-form';
import { Expense, EditExpenseFormData } from '@/lib/types/expenses';

interface EditExpenseFormProps {
  expense: Expense;
  onSubmit: (data: EditExpenseFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function EditExpenseForm({
  expense,
  onSubmit,
  onCancel,
  isLoading
}: EditExpenseFormProps) {
  return (
    <Card className="p-6 sm:p-8 bg-white border border-gray-200 shadow-sm">
      <ExpenseForm
        expense={expense}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </Card>
  );
}