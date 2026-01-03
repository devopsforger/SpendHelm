export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  preferred_currency: string;
}

export interface ChartDataPoint {
  day: string;
  amount: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color?: string;
}
