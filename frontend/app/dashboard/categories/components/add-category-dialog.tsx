'use client';

import { useState, FormEvent } from 'react';
import { Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  isLoading: boolean;
}

export default function AddCategoryDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: AddCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    onSubmit({ name: categoryName.trim() });
    setCategoryName('');
  };

  const handleClose = () => {
    setCategoryName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-linear-to-br from-[#551931]/20 to-[#7a2547]/20 rounded flex items-center justify-center">
              <Tag className="w-3 h-3 text-[#551931]" />
            </div>
            Add New Category
          </DialogTitle>
          <DialogDescription>
            Create a custom category for your expenses
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-700">
              Category Name
            </Label>
            <Input
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Groceries, Rent, Entertainment"
              className="mt-1.5 border-gray-300 focus:border-[#551931] focus:ring-[#551931]/20"
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a descriptive name for your category
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading || !categoryName.trim()}
              className="flex-1 bg-linear-to-r from-[#551931] to-[#7a2547] hover:from-[#6b2040] hover:to-[#8a2c52] text-white"
            >
              {isLoading ? 'Adding...' : 'Add Category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}