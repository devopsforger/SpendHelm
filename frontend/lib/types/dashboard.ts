import {LucideIcon} from "lucide-react";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar?: string;
}

export interface NavItem {
  name: string;
  icon: LucideIcon;
  page: string;
  href: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPageName?: string;
}
