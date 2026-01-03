import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Expense, Category } from '@/lib/types/dashboard';

interface RecentExpensesProps {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  hasExpenses: boolean;
}

export default function RecentExpenses({
  expenses,
  categories,
  currency,
  hasExpenses
}: RecentExpensesProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#101828]">Recent Expenses</h2>
        <Link href="/dashboard/expenses">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#551931] hover:text-[#7a2547] hover:bg-[#551931]/5"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {!hasExpenses ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">$</span>
            </div>
          </div>
          <p className="text-gray-500 mb-4">No expenses recorded yet.</p>
          <Link href="/dashboard/add-expense">
            <Button className="bg-linear-to-r from-[#551931] to-[#7a2547] hover:from-[#6b2040] hover:to-[#8a2c52] text-white shadow-md">
              Add Your First Expense
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const category = categories.find(c => c.name === expense.category);
            const categoryColor = category?.color || '#551931';

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      border: `1px solid ${categoryColor}30`
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: categoryColor }}
                    >
                      {expense.category?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#101828]">{expense.category}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                      {expense.note && ` • ${expense.note}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#101828] text-lg">
                    {currency} {expense.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}