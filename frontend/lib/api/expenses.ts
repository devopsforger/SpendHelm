import {
  Expense,
  ExpenseFormData,
  EditExpenseFormData,
} from "@/lib/types/expenses";

export const expensesService = {
  async getExpenses(): Promise<Expense[]> {
    const response = await fetch("/api/expenses", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch expenses");
    return response.json();
  },
  async getExpense(id: string): Promise<Expense> {
    const response = await fetch(`/api/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch expense");
    return response.json();
  },
  async createExpense(data: ExpenseFormData): Promise<Expense> {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        amount: parseFloat(data.amount),
      }),
    });
    if (!response.ok) throw new Error("Failed to create expense");
    return response.json();
  },

  async updateExpense(id: string, data: EditExpenseFormData): Promise<Expense> {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        amount: parseFloat(data.amount),
      }),
    });
    if (!response.ok) throw new Error("Failed to update expense");
    return response.json();
  },
  async deleteExpense(id: string): Promise<void> {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete expense");
  },
};
