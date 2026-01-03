'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wallet, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export default function MobileHeader({
  onMenuToggle,
  menuOpen = false
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle?.();
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center shadow-sm">
            <Wallet className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#101828] tracking-tight">SpendHelm</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuToggle}
          className="text-gray-600"
        >
          {menuOpen || isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
}