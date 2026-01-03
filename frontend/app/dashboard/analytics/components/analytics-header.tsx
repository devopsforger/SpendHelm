'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnalyticsHeaderProps {
  period: 'week' | 'month' | 'all';
  onPeriodChange: (period: 'week' | 'month' | 'all') => void;
}

export default function AnalyticsHeader({ period, onPeriodChange }: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#101828]">Analytics</h1>
          <p className="text-gray-500 text-sm sm:text-base">Detailed spending insights</p>
        </div>
      </div>
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-40 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}