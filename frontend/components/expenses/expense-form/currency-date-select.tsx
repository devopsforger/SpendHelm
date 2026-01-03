'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrencyDateSelectProps {
  currency: string;
  date: string;
  onCurrencyChange: (value: string) => void;
  onDateChange: (value: string) => void;
  userCurrency?: string;
  isLoading: boolean;
}

export default function CurrencyDateSelect({
  currency,
  date,
  onCurrencyChange,
  onDateChange,
  userCurrency,
  isLoading
}: CurrencyDateSelectProps) {
  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Currency */}
      <div>
        <Label htmlFor="currency" className="text-sm font-medium text-[#101828] flex items-center gap-1">
          Currency <span className="text-[#F14926]">*</span>
        </Label>
        <div className="relative mt-1.5">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Globe className="w-4 h-4 text-gray-400" />
          </div>
          <Select value={currency} onValueChange={onCurrencyChange} disabled={isLoading}>
            <SelectTrigger className="pl-10 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {userCurrency && (
                <SelectItem value={userCurrency} className="font-medium">
                  {userCurrency} (Preferred)
                </SelectItem>
              )}
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date" className="text-sm font-medium text-[#101828] flex items-center gap-1">
          Date <span className="text-[#F14926]">*</span>
        </Label>
        <div className="relative mt-1.5">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
            max={today}
            className="pl-10 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20"
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Cannot be in the future
        </p>
      </div>
    </div>
  );
}