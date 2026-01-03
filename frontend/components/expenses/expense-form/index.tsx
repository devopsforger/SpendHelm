'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { categoriesService } from '@/lib/api/categories';
import { authService } from '@/lib/auth';
import { ExpenseFormProps, Expense, User } from '@/lib/types/expenses';
import { Button } from '@/components/ui/button';
import AmountInput from './amount-input';
import CurrencyDateSelect from './currency-date-select';
import CategorySelect from './category-select';
import NoteTextarea from './note-textarea';

export default function ExpenseForm({
  expense,
  onSubmit,
  onCancel,
  isLoading
}: ExpenseFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    currency: expense?.currency || 'USD',
    category: expense?.category || '',
    date: expense?.date || format(new Date(), 'yyyy-MM-dd'),
    note: expense?.note || '',
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        if (!expense) {
          setFormData(prev => ({
            ...prev,
            currency: userData?.preferred_currency || 'USD'
          }));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, [expense]);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AmountInput
        value={formData.amount}
        onChange={(value) => handleChange('amount', value)}
        isLoading={isLoading}
      />

      <CurrencyDateSelect
        currency={formData.currency}
        date={formData.date}
        onCurrencyChange={(value) => handleChange('currency', value)}
        onDateChange={(value) => handleChange('date', value)}
        userCurrency={user?.preferred_currency}
        isLoading={isLoading}
      />

      <CategorySelect
        value={formData.category}
        onChange={(value) => handleChange('category', value)}
        categories={categories}
        isLoading={isLoading || categoriesLoading}
      />

      <NoteTextarea
        value={formData.note}
        onChange={(value) => handleChange('note', value)}
        isLoading={isLoading}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !formData.amount || !formData.category || !formData.date}
          className="flex-1 bg-linear-to-r from-[#551931] to-[#7a2547] hover:from-[#6b2040] hover:to-[#8a2c52] text-white h-11 shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}