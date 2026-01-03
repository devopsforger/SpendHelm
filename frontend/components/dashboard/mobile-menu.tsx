'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navItems } from '@/lib/data/navigation';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types/dashboard';

interface MobileMenuProps {
  user: User | null;
  currentPageName: string;
  onLogout: () => void;
}

export default function MobileMenu({ user, currentPageName, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40 bg-white pt-14">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
              currentPageName === item.page
                ? "bg-[#551931]/10 text-[#551931]"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}

        {/* User Info */}
        <div className="my-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
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
        </div>

        <hr className="my-4" />

        <Button
          variant="ghost"
          onClick={() => {
            onLogout();
            setIsOpen(false);
          }}
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-3 h-auto"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </nav>
    </div>
  );
}