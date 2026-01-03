'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/lib/api/expenses';
import { ExpenseFormData } from '@/lib/types/expenses';
import { Card } from '@/components/ui/card';
import ExpenseForm from '@/components/expenses/expense-form';
import AddExpenseHeader from './components/add-expense-header';
import AddExpenseInfo from './components/add-expense-info';

export default function AddExpensePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: expensesService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      alert(`Failed to add expense: ${error.message}`);
    }
  });

  const handleSubmit = (data: ExpenseFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AddExpenseHeader onBack={() => router.push('/dashboard')} />

      <Card className="p-6 sm:p-8 bg-white border border-gray-200 shadow-sm">
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/dashboard')}
          isLoading={createMutation.isPending}
        />
      </Card>

      <AddExpenseInfo />
    </div>
  );
}