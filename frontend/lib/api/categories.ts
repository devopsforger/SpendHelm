import {Category, AddCategoryFormData} from "@/lib/types/categories";

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },

  async createCategory(data: AddCategoryFormData): Promise<Category> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({...data, is_default: false}),
    });
    if (!response.ok) throw new Error("Failed to create category");
    return response.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete category");
  },
};
