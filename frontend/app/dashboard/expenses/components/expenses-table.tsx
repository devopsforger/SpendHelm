import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expense } from '@/lib/types/expenses';
import { Category } from '@/lib/types/categories';
import EmptyState from './expenses-empty-state';
import ExpenseRow from '@/components/expenses/expense-row';

interface ExpensesTableProps {
  expenses: Expense[];
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpensesTable({
  expenses,
  categories,
  onEdit,
  onDelete
}: ExpensesTableProps) {
  if (expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Note
            </th>
            <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(expense.date), 'MMM d, yyyy')}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                <ExpenseRow expense={expense} categories={categories} />
              </td>
              <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {expense.note || '—'}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-[#101828]">
                {expense.currency} {expense.amount.toFixed(2)}
              </td>
              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    className="text-[#551931] hover:text-[#7a2547] hover:bg-[#551931]/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}