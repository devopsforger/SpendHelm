'use client';

import Link from 'next/link';
import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navItems } from '@/lib/data/navigation';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types/dashboard';

interface SidebarProps {
  user: User | null;
  currentPageName: string;
  onLogout: () => void;
}

export default function Sidebar({ user, currentPageName, onLogout }: SidebarProps) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:border-r lg:border-gray-100">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center shadow-sm">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-[#101828] tracking-tight">SpendHelm</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50",
                currentPageName === item.page
                  ? "bg-[#551931]/10 text-[#551931]"
                  : "text-gray-600 hover:text-[#101828]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-linear-to-br from-[#551931]/20 to-[#7a2547]/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-[#551931]">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#101828] truncate">
                {user?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}