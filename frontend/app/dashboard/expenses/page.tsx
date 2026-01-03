'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '@/lib/api/expenses';
import { categoriesService } from '@/lib/api/categories';
import { Expense, ExpenseFilters, EditExpenseFormData } from '@/lib/types/expenses';
import { Card } from '@/components/ui/card';
import ExpensesHeader from './components/expenses-header';
import ExpensesFilters from './components/expenses-filters';
import ExpensesTotal from './components/expenses-total';
import ExpensesTable from './components/expenses-table';
import EditExpenseDialog from '@/components/expenses/edit-dialog';
import LoadingSpinner from '@/components/dashboard/loading-spinner';

const defaultFilters: ExpenseFilters = {
  searchQuery: '',
  categoryFilter: 'all',
  sortOrder: '-date',
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch expenses
  const {
    data: expenses = [],
    isLoading,
    error
  } = useQuery<Expense[], Error>({
    queryKey: ['expenses'],
    queryFn: expensesService.getExpenses,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: expensesService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (error: Error) => {
      alert(`Failed to delete expense: ${error.message}`);
    }
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditExpenseFormData }) =>
      expensesService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowEditDialog(false);
      setEditingExpense(null);
    },
    onError: (error: Error) => {
      alert(`Failed to update expense: ${error.message}`);
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditDialog(true);
  };

  const handleUpdate = (data: EditExpenseFormData) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    }
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchesSearch = !filters.searchQuery ||
        exp.category?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        exp.note?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesCategory = filters.categoryFilter === 'all' ||
        exp.category === filters.categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (filters.sortOrder) {
        case '-date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case '-amount':
          return b.amount - a.amount;
        case 'amount':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  const total = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Expenses</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => queryClient.refetchQueries({ queryKey: ['expenses'] })}
            className="bg-[#551931] text-white px-4 py-2 rounded-lg hover:bg-[#6b2040]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ExpensesHeader />

      <ExpensesFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      <ExpensesTotal
        count={filteredExpenses.length}
        total={total}
      />

      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <ExpensesTable
          expenses={filteredExpenses}
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Card>

      <EditExpenseDialog
        expense={editingExpense}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingExpense(null);
        }}
        onUpdate={handleUpdate}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}