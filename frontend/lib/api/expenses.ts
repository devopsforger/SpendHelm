import {Expense, ExpenseFormData} from "@/lib/types/expenses";

export const expensesService = {
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

  async updateExpense(id: string, data: ExpenseFormData): Promise<Expense> {
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
};
