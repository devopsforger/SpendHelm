'use client';

import { Label } from '@/components/ui/label';
import { Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Category } from '@/lib/types/expenses';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
  isLoading: boolean;
}

export default function CategorySelect({
  value,
  onChange,
  categories,
  isLoading
}: CategorySelectProps) {
  return (
    <div>
      <Label htmlFor="category" className="text-sm font-medium text-[#101828] flex items-center gap-1">
        Category <span className="text-[#F14926]">*</span>
      </Label>
      <div className="relative mt-1.5">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Tag className="w-4 h-4 text-gray-400" />
        </div>
        <Select value={value} onValueChange={onChange} disabled={isLoading}>
          <SelectTrigger className="pl-10 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <SelectItem value="General" disabled>
                No categories available
              </SelectItem>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  <div className="flex items-center gap-2">
                    {cat.color && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    {cat.name}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      {categories.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Create categories in the Categories page first
        </p>
      )}
    </div>
  );
}