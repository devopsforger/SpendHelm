import {
  LayoutDashboard,
  List,
  PlusCircle,
  FolderOpen,
  Settings,
  TrendingUp,
} from "lucide-react";
import {NavItem} from "@/lib/types/dashboard";

export const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    page: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Expenses",
    icon: List,
    page: "Expenses",
    href: "/dashboard/expenses",
  },
  {
    name: "Add Expense",
    icon: PlusCircle,
    page: "AddExpense",
    href: "/dashboard/add-expense",
  },
  {
    name: "Analytics",
    icon: TrendingUp,
    page: "Analytics",
    href: "/dashboard/analytics",
  },
  {
    name: "Categories",
    icon: FolderOpen,
    page: "Categories",
    href: "/dashboard/categories",
  },
  {
    name: "Settings",
    icon: Settings,
    page: "Preferences",
    href: "/dashboard/settings",
  },
];

export const publicPages = ["/", "/login", "/register", "/forgot-password"];
