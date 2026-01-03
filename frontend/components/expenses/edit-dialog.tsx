'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ExpenseForm from '@/components/expenses/expense-form';
import { Expense, EditExpenseFormData } from '@/lib/types/expenses';

interface EditExpenseDialogProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: EditExpenseFormData) => void;
  isLoading: boolean;
}

export default function EditExpenseDialog({
  expense,
  isOpen,
  onClose,
  onUpdate,
  isLoading
}: EditExpenseDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Make changes to this expense
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          expense={expense}
          onSubmit={onUpdate}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}