'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/lib/api/categories';
import { Category } from '@/lib/types/categories';
import CategoriesHeader from './components/categories-header';
import AddCategoryDialog from './components/add-category-dialog';
import CategoriesGrid from './components/categories-grid';
import EmptyState from './components/empty-state';
import LoadingSpinner from '@/components/dashboard/loading-spinner';

export default function CategoriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch categories
  const {
    data: categories = [],
    isLoading,
    error
  } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoriesService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      alert(`Failed to create category: ${error.message}`);
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: categoriesService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      alert(`Failed to delete category: ${error.message}`);
    }
  });

  const handleAddCategory = (data: { name: string }) => {
    createMutation.mutate(data);
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.is_default) {
      alert('Cannot delete default categories');
      return;
    }

    if (window.confirm(`Delete "${category.name}" category?`)) {
      deleteMutation.mutate(category.id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Categories</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => queryClient.refetchQueries({ queryKey: ['categories'] })}
            className="bg-[#551931] text-white px-4 py-2 rounded-lg hover:bg-[#6b2040]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const defaultCategories = categories.filter(c => c.is_default);
  const userCategories = categories.filter(c => !c.is_default);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CategoriesHeader
        onAddClick={() => setIsAddDialogOpen(true)}
        hasCategories={categories.length > 0}
      />

      <AddCategoryDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddCategory}
        isLoading={createMutation.isPending}
      />

      {categories.length === 0 ? (
        <EmptyState onAddClick={() => setIsAddDialogOpen(true)} />
      ) : (
        <>
          {userCategories.length > 0 && (
            <CategoriesGrid
              title="Your Categories"
              categories={userCategories}
              onDelete={handleDeleteCategory}
              isDeletable={true}
            />
          )}

          {defaultCategories.length > 0 && (
            <CategoriesGrid
              title="Default Categories"
              categories={defaultCategories}
              isDeletable={false}
            />
          )}
        </>
      )}
    </div>
  );
}