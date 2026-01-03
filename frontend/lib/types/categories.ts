export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  is_default: boolean;
  created_at: string;
}

export interface AddCategoryFormData {
  name: string;
  color?: string;
}
