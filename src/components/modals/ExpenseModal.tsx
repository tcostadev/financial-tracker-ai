import React from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Category, Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
  expenseForm: any;
  setExpenseForm: (form: any) => void;
  handleSaveExpense: (e: React.FormEvent) => void;
  categories: Category[];
  isSaving?: boolean;
}

export const ExpenseModal = ({
  isOpen,
  onClose,
  editingExpense,
  expenseForm,
  setExpenseForm,
  handleSaveExpense,
  categories,
  isSaving
}: ExpenseModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingExpense ? "Edit Expense" : "Add New Expense"}
    >
      <form onSubmit={handleSaveExpense} className="space-y-6">
        {/* ... existing fields ... */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              className="pl-8 text-2xl font-bold"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Description</label>
          <Input 
            placeholder="What was this for?" 
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Category</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50"
              value={expenseForm.categoryId}
              onChange={(e) => setExpenseForm({...expenseForm, categoryId: e.target.value})}
              required
            >
              <option value="" disabled>Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Date</label>
            <Input 
              type="date" 
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSaving}>
            {editingExpense ? "Update Expense" : "Save Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
