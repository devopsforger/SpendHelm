'use client';

import { useState, useEffect } from 'react';
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/api/dashboard';
import { Expense, Category, User } from '@/lib/types/dashboard';
import DashboardHeader from './components/dashboard-header';
import AggregateCards from './components/aggregate-cards';
import ChartPreviews from './components/chart-previews';
import RecentExpenses from './components/recent-expenses';
import LoadingSpinner from '@/components/dashboard/loading-spinner';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const now = new Date();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await dashboardService.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Fetch expenses
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: dashboardService.getExpenses,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: dashboardService.getCategories,
  });

  // Calculate period totals
  const calculatePeriodTotal = (startDate: Date, endDate: Date): number => {
    return expenses
      .filter(exp => {
        const expDate = new Date(exp.date);
        return expDate >= startDate && expDate <= endDate;
      })
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
  };

  const todayTotal = calculatePeriodTotal(startOfDay(now), endOfDay(now));
  const weekTotal = calculatePeriodTotal(startOfWeek(now, { weekStartsOn: 1 }), endOfDay(now));
  const monthTotal = calculatePeriodTotal(startOfMonth(now), endOfDay(now));

  // Last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const total = calculatePeriodTotal(dayStart, dayEnd);

    return {
      day: format(date, 'EEE'),
      amount: total,
    };
  });

  // Recent expenses
  const recentExpenses = expenses.slice(0, 5);

  // Category breakdown for pie chart
  const monthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= startOfMonth(now) && expDate <= endOfDay(now);
  });

  const categoryTotals: Record<string, number> = {};
  monthExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const pieData = Object.entries(categoryTotals)
    .map(([category, total]) => {
      const cat = categories.find(c => c.name === category);
      return {
        name: category,
        value: total,
        color: cat?.color || '#6b7280',
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const currency = user?.preferred_currency || 'USD';

  if (expensesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <DashboardHeader date={now} />

      <AggregateCards
        todayTotal={todayTotal}
        weekTotal={weekTotal}
        monthTotal={monthTotal}
        currency={currency}
      />

      <ChartPreviews
        chartData={chartData}
        pieData={pieData}
        currency={currency}
      />

      <RecentExpenses
        expenses={recentExpenses}
        categories={categories}
        currency={currency}
        hasExpenses={expenses.length > 0}
      />
    </div>
  );
}