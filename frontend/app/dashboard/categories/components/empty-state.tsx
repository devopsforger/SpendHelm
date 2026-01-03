import { Tag, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddClick: () => void;
}

export default function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <Card className="p-12 bg-white border border-gray-200 text-center">
      <div className="w-20 h-20 bg-linear-to-br from-[#551931]/10 to-[#7a2547]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-[#551931] to-[#7a2547] rounded-lg flex items-center justify-center">
          <Tag className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-[#101828] mb-2">No categories yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Categories help you organize and analyze your expenses.
        Create your first category to get started.
      </p>
      <Button
        onClick={onAddClick}
        className="bg-linear-to-r from-[#551931] to-[#7a2547] hover:from-[#6b2040] hover:to-[#8a2c52] text-white shadow-md hover:shadow-lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create First Category
      </Button>
    </Card>
  );
}