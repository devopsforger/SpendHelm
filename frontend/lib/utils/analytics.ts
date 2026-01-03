import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Expense,
  ChartDataPoint,
  PieChartData,
  CategoryBreakdownItem,
  Category,
} from "@/lib/types/analytics";

export const analyticsUtils = {
  // Get date range based on period
  getDateRange(period: string, now: Date) {
    switch (period) {
      case "week":
        return {
          start: startOfWeek(now, {weekStartsOn: 1}),
          end: endOfWeek(now, {weekStartsOn: 1}),
        };
      case "month":
        return {start: startOfMonth(now), end: endOfMonth(now)};
      default:
        return {start: new Date(0), end: now}; // all time
    }
  },

  // Filter expenses by date range
  filterExpensesByPeriod(
    expenses: Expense[],
    start: Date,
    end: Date
  ): Expense[] {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= start && expDate <= end;
    });
  },

  // Generate daily data for last 7 days
  generateDailyData(expenses: Expense[], now: Date): ChartDataPoint[] {
    return Array.from({length: 7}, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayTotal = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate >= dayStart && expDate <= dayEnd;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        day: format(date, "EEE"),
        amount: dayTotal,
      };
    });
  },

  // Generate pie chart data
  generatePieChartData(
    expenses: Expense[],
    categories: Category[]
  ): PieChartData[] {
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, total]) => {
        const cat = categories.find((c) => c.name === category);
        return {
          name: category,
          value: total,
          color: cat?.color || "#6b7280",
        };
      })
      .sort((a, b) => b.value - a.value);
  },

  // Generate line chart data (last 30 days)
  generateLineChartData(expenses: Expense[]): ChartDataPoint[] {
    const dailyData: Record<string, number> = {};

    expenses.forEach((exp) => {
      const day = format(new Date(exp.date), "MMM dd");
      dailyData[day] = (dailyData[day] || 0) + exp.amount;
    });

    return Object.entries(dailyData)
      .map(([day, amount]) => ({day, amount}))
      .slice(-30);
  },

  // Generate category breakdown
  generateCategoryBreakdown(
    expenses: Expense[],
    categories: Category[],
    total: number
  ): CategoryBreakdownItem[] {
    const categoryTotals: Record<string, {amount: number; count: number}> = {};

    expenses.forEach((exp) => {
      if (!categoryTotals[exp.category]) {
        categoryTotals[exp.category] = {amount: 0, count: 0};
      }
      categoryTotals[exp.category].amount += exp.amount;
      categoryTotals[exp.category].count += 1;
    });

    return Object.entries(categoryTotals)
      .map(([category, data]) => {
        const cat = categories.find((c) => c.name === category);
        return {
          category,
          amount: data.amount,
          percentage: (data.amount / total) * 100,
          count: data.count,
          color: cat?.color || "#6b7280",
        };
      })
      .sort((a, b) => b.amount - a.amount);
  },

  // Get period label
  getPeriodLabel(period: string): string {
    switch (period) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      default:
        return "All Time";
    }
  },
};
