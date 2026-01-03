import { Category } from '@/lib/types/categories';
import { Expense } from '@/lib/types/expenses';

interface ExpenseRowProps {
  expense: Expense;
  categories: Category[];
}

export default function ExpenseRow({ expense, categories }: ExpenseRowProps) {
  const category = categories.find(c => c.name === expense.category);

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium"
      style={{
        backgroundColor: category?.color ? `${category.color}15` : '#55193115',
        color: category?.color || '#551931'
      }}
    >
      {expense.category}
    </span>
  );
}