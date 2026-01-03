import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#551931] rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-[#101828] tracking-tight">
            SpendHelm
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-[#101828] hover:bg-gray-50">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#551931] hover:bg-[#6b2040] text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}