'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { expensesService } from '@/lib/api/expenses';
import { categoriesService } from '@/lib/api/categories';
import { authService } from '@/lib/auth';
import { User, Expense, Category } from '@/lib/types/analytics';
import { analyticsUtils } from '@/lib/utils/analytics';
import AnalyticsHeader from './components/analytics-header';
import AnalyticsTotal from './components/analytics-total';
import ChartTabs from './components/chart-tabs';
import CategoryBreakdown from './components/category-breakdown';
import LoadingSpinner from '@/components/dashboard/loading-spinner';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [user, setUser] = useState<User | null>(null);
  const now = new Date();

  // Fetch user data
  useState(() => {
    const loadUser = async () => {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    };
    loadUser();
  });

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
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Calculate analytics data
  const { start, end } = analyticsUtils.getDateRange(period, now);
  const filteredExpenses = analyticsUtils.filterExpensesByPeriod(expenses, start, end);
  const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const barData = analyticsUtils.generateDailyData(filteredExpenses, now);
  const pieData = analyticsUtils.generatePieChartData(filteredExpenses, categories);
  const lineData = analyticsUtils.generateLineChartData(filteredExpenses);
  const categoryBreakdown = analyticsUtils.generateCategoryBreakdown(filteredExpenses, categories, total);

  const currency = user?.preferred_currency || 'USD';

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
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
      <AnalyticsHeader period={period} onPeriodChange={setPeriod} />

      <AnalyticsTotal
        period={period}
        total={total}
        currency={currency}
      />

      <ChartTabs
        chartType={chartType}
        onChartTypeChange={setChartType}
        barData={barData}
        pieData={pieData}
        lineData={lineData}
        currency={currency}
        hasData={filteredExpenses.length > 0}
      />

      <CategoryBreakdown
        data={categoryBreakdown}
        currency={currency}
        hasData={categoryBreakdown.length > 0}
      />
    </div>
  );
}