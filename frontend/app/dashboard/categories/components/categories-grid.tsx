import { Tag, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/types/categories';

interface CategoriesGridProps {
  title: string;
  categories: Category[];
  onDelete?: (category: Category) => void;
  isDeletable: boolean;
}

export default function CategoriesGrid({
  title,
  categories,
  onDelete,
  isDeletable
}: CategoriesGridProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </h2>
      <div className="grid md:grid-cols-2 gap-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`p-4 border ${category.is_default
              ? 'bg-gray-50 border-gray-200'
              : 'bg-white border-gray-200 hover:border-[#551931]/30 hover:shadow-sm transition-all'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.is_default
                  ? 'bg-gray-200'
                  : 'bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10'
                  }`}>
                  <Tag className={`w-5 h-5 ${category.is_default ? 'text-gray-600' : 'text-[#551931]'
                    }`} />
                </div>
                <div>
                  <span className="font-medium text-[#101828] block">{category.name}</span>
                  {category.is_default && (
                    <span className="text-xs text-gray-500">System default</span>
                  )}
                </div>
              </div>
              {isDeletable && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(category)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title={`Delete ${category.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}