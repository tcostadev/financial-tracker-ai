import React from 'react';
import { TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { Card } from './ui/Card';
import { Income } from '../types';

interface IncomeTabProps {
  incomes: Income[];
  openEditIncome: (income: Income) => void;
  handleDeleteIncome: (id: string) => void;
}

export const IncomeTab = ({
  incomes,
  openEditIncome,
  handleDeleteIncome
}: IncomeTabProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-0 overflow-hidden border-none shadow-premium bg-white">
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomes.map((income) => (
                <tr key={income.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                      {income.source}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{income.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-400">{format(parseISO(income.date), 'MMM dd, yyyy')}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-600 font-mono">+€{income.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditIncome(income)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteIncome(income.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-zinc-100">
          {incomes.map((income) => (
            <div key={income.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 text-sm">{income.description}</p>
                  <p className="text-xs text-zinc-500">{format(parseISO(income.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-emerald-600">+€{income.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{income.source}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEditIncome(income)} className="p-1 text-zinc-400">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDeleteIncome(income.id)} className="p-1 text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {incomes.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500">No income records found. Add your first income to track your net worth.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
