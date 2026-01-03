import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoriesHeaderProps {
  onAddClick: () => void;
  hasCategories: boolean;
}

export default function CategoriesHeader({ onAddClick, hasCategories }: CategoriesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-[#101828] mb-1">Categories</h1>
        <p className="text-gray-500">
          {hasCategories
            ? 'Organize your expenses'
            : 'Create categories to organize your expenses'
          }
        </p>
      </div>
      <Button
        onClick={onAddClick}
        className="bg-linear-to-r from-[#F14926] to-[#e63e1b] hover:from-[#d93d1d] hover:to-[#c83212] text-white shadow-md hover:shadow-lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Category
      </Button>
    </div>
  );
}