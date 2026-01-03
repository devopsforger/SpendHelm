import {LucideIcon} from "lucide-react";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}

export interface NavItem {
  name: string;
  icon: LucideIcon;
  page: string;
  href: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar?: string;
  preferred_currency?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  note?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface ChartData {
  day: string;
  amount: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface AggregateCardProps {
  label: string;
  amount: number;
  currency: string;
  icon: React.ComponentType<{className?: string}>;
}
