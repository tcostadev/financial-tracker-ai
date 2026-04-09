import React from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Income } from '../../types';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingIncome: Income | null;
  incomeForm: any;
  setIncomeForm: (form: any) => void;
  handleSaveIncome: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

export const IncomeModal = ({
  isOpen,
  onClose,
  editingIncome,
  incomeForm,
  setIncomeForm,
  handleSaveIncome,
  isSaving
}: IncomeModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingIncome ? "Edit Income" : "Add New Income"}
    >
      <form onSubmit={handleSaveIncome} className="space-y-6">
        {/* ... existing fields ... */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">€</span>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              className="pl-8 text-2xl font-bold"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
              required
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Description</label>
          <Input 
            placeholder="e.g. Monthly Salary, Freelance Project" 
            value={incomeForm.description}
            onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Source</label>
            <select 
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-zinc-50/50"
              value={incomeForm.source}
              onChange={(e) => setIncomeForm({...incomeForm, source: e.target.value})}
              required
            >
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Investment">Investment</option>
              <option value="Gift">Gift</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700">Date</label>
            <Input 
              type="date" 
              value={incomeForm.date}
              onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSaving}>
            {editingIncome ? "Update Income" : "Save Income"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
