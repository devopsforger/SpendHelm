export interface ExpenseFormData {
  amount: string;
  currency: string;
  category: string;
  date: string;
  note: string;
}

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  note?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  is_default: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  preferred_currency?: string;
}

export interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}
