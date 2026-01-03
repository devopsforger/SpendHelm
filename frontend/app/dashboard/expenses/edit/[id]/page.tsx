'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/lib/api/expenses';
import { authService } from '@/lib/auth';
import { Expense, EditExpenseFormData } from '@/lib/types/expenses';
import EditExpenseHeader from '../../components/edit-expense-header';
import EditExpenseForm from '../../components/edit-expense-form';
import LoadingSpinner from '@/components/dashboard/loading-spinner';
import { Button } from '@/components/ui/button';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const expenseId = params.id as string;

  // Fetch expense
  const {
    data: expense,
    isLoading,
    error
  } = useQuery<Expense, Error>({
    queryKey: ['expense', expenseId],
    queryFn: () => expensesService.getExpense(expenseId),
    enabled: !!expenseId,
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: (data: EditExpenseFormData) =>
      expensesService.updateExpense(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', expenseId] });
      router.push('/dashboard/expenses');
    },
    onError: (error: Error) => {
      alert(`Failed to update expense: ${error.message}`);
    }
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: () => expensesService.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      router.push('/dashboard/expenses');
    },
    onError: (error: Error) => {
      alert(`Failed to delete expense: ${error.message}`);
    }
  });

  const handleUpdate = (data: EditExpenseFormData) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !expense) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">!</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Expense Not Found</h2>
        <p className="text-gray-600 mb-4">{`The expense you're looking for doesn't exist.`}</p>
        <Button
          onClick={() => router.push('/dashboard/expenses')}
          className="bg-[#551931] text-white px-4 py-2 rounded-lg hover:bg-[#6b2040]"
        >
          Back to Expenses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <EditExpenseHeader
        onBack={() => router.back()}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <EditExpenseForm
        expense={expense}
        onSubmit={handleUpdate}
        onCancel={() => router.back()}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}