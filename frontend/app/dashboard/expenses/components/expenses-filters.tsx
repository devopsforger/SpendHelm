'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpenseFilters } from '@/lib/types/expenses';
import { Category } from '@/lib/types/categories';

interface ExpensesFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
  categories: Category[];
}

export default function ExpensesFilters({
  filters,
  onFiltersChange,
  categories
}: ExpensesFiltersProps) {
  const handleChange = (key: keyof ExpenseFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 shadow-sm">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search expenses..."
            value={filters.searchQuery}
            onChange={(e) => handleChange('searchQuery', e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20"
          />
        </div>

        {/* Category Filter */}
        <Select value={filters.categoryFilter} onValueChange={(val) => handleChange('categoryFilter', val)}>
          <SelectTrigger className="border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={filters.sortOrder} onValueChange={(val) => handleChange('sortOrder', val)}>
          <SelectTrigger className="border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-date">Newest First</SelectItem>
            <SelectItem value="date">Oldest First</SelectItem>
            <SelectItem value="-amount">Highest Amount</SelectItem>
            <SelectItem value="amount">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}