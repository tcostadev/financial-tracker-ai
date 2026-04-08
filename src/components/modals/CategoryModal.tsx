import React from 'react';
import { Palette } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Category } from '../../types';
import { cn } from '../../lib/utils';
import { IconMap, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../../constants';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
  categoryForm: any;
  setCategoryForm: (form: any) => void;
  handleSaveCategory: (e: React.FormEvent) => void;
  isSaving?: boolean;
}

export const CategoryModal = ({
  isOpen,
  onClose,
  editingCategory,
  categoryForm,
  setCategoryForm,
  handleSaveCategory,
  isSaving
}: CategoryModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingCategory ? "Edit Category" : "Add New Category"}
    >
      <form onSubmit={handleSaveCategory} className="space-y-6">
        {/* ... existing fields ... */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Category Name</label>
          <Input 
            placeholder="e.g. Groceries, Rent, etc." 
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
            required
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-700">Monthly Budget (Optional)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
            <Input 
              type="number" 
              placeholder="0.00" 
              className="pl-8"
              value={categoryForm.budget}
              onChange={(e) => setCategoryForm({...categoryForm, budget: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Pick Icon & Color
          </label>
          
          <div className="grid grid-cols-6 gap-2">
            {AVAILABLE_ICONS.map(iconName => (
              <button
                key={iconName}
                type="button"
                disabled={isSaving}
                onClick={() => setCategoryForm({...categoryForm, icon: iconName})}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all flex items-center justify-center",
                  categoryForm.icon === iconName 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                    : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                )}
              >
                {IconMap[iconName]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map(color => (
              <button
                key={color}
                type="button"
                disabled={isSaving}
                onClick={() => setCategoryForm({...categoryForm, color: color})}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  categoryForm.color === color 
                    ? "border-zinc-900 scale-110" 
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSaving}>
            {editingCategory ? "Update Category" : "Save Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
