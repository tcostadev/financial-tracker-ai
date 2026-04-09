import React from 'react';
import { Search, Filter, Receipt, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Expense, Category } from '../types';
import { IconMap } from '../constants';

interface ExpenseTabProps {
  expenses: Expense[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  openEditExpense: (expense: Expense) => void;
  handleDeleteExpense: (id: string) => void;
}

export const ExpenseTab = ({
  expenses,
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  openEditExpense,
  handleDeleteExpense
}: ExpenseTabProps) => {
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select 
              className="text-sm font-medium focus:outline-none bg-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-premium bg-white">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((expense) => {
                const category = categories.find(c => c.id === expense.categoryId);
                return (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{expense.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#ccc' }} />
                        <span className="text-sm font-medium text-slate-600">{category?.name || 'Uncategorized'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-400">{format(parseISO(expense.date), 'MMM dd, yyyy')}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-slate-900 font-mono">-€{expense.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditExpense(expense)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-zinc-100">
          {filteredExpenses.map((expense) => {
            const category = categories.find(c => c.id === expense.categoryId);
            return (
              <div key={expense.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category?.color || '#ccc'}20`, color: category?.color || '#ccc' }}
                  >
                    {category ? IconMap[category.icon] : <Receipt className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{expense.description}</p>
                    <p className="text-xs text-zinc-500">{format(parseISO(expense.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-zinc-900">-€{expense.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{category?.name || 'Uncategorized'}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditExpense(expense)} className="p-1 text-zinc-400">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-1 text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filteredExpenses.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500">No transactions found matching your criteria.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
