import {Expense, Category} from "@/lib/types/dashboard";

// Replace with your actual API calls
export const dashboardService = {
  async getUser(): Promise<any> {
    const response = await fetch("/api/user/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  async getExpenses(): Promise<Expense[]> {
    const response = await fetch("/api/expenses", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch expenses");
    return response.json();
  },

  async getCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },
};
