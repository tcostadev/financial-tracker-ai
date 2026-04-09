import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from './ui/Card';
import { Category, Expense } from '../types';
import { IconMap, AVAILABLE_ICONS, AVAILABLE_COLORS } from '../constants';

interface CategoryTabProps {
  categories: Category[];
  expenses: Expense[];
  openEditCategory: (category: Category) => void;
  handleDeleteCategory: (id: string) => void;
  setIsAddCategoryModalOpen: (isOpen: boolean) => void;
  setEditingCategory: (category: Category | null) => void;
  setCategoryForm: (form: any) => void;
}

export const CategoryTab = ({
  categories,
  expenses,
  openEditCategory,
  handleDeleteCategory,
  setIsAddCategoryModalOpen,
  setEditingCategory,
  setCategoryForm
}: CategoryTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {categories.map((category) => (
        <Card key={category.id} className="relative group border-none shadow-premium bg-white hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {IconMap[category.icon]}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditCategory(category)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-1">{category.name}</h4>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>Monthly Budget</span>
            <span className="text-slate-900 font-mono">€{category.budget?.toLocaleString() || '0'}</span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((expenses.filter(e => e.categoryId === category.id).reduce((sum, e) => sum + e.amount, 0) / (category.budget || 1)) * 100, 100)}%` }}
              className="h-full transition-all duration-1000" 
              style={{ backgroundColor: category.color }} 
            />
          </div>
        </Card>
      ))}
      <button 
        onClick={() => { 
          setEditingCategory(null); 
          setCategoryForm({ name: '', icon: AVAILABLE_ICONS[0], color: AVAILABLE_COLORS[0], budget: '' }); 
          setIsAddCategoryModalOpen(true); 
        }}
        className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group"
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-bold uppercase tracking-widest text-xs">Add New Category</span>
      </button>
    </motion.div>
  );
};
