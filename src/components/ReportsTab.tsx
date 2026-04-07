import React, { useState, useMemo } from 'react';
import { TrendingUp, Printer, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { motion } from 'motion/react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { TabType, Expense, Category } from '../types';
import { cn } from '../lib/utils';

interface ReportsTabProps {
  setActiveTab: (tab: TabType) => void;
  expenses: Expense[];
  categories: Category[];
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const ReportsTab = ({ setActiveTab, expenses, categories }: ReportsTabProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reportData = useMemo(() => {
    const yearExpenses = expenses.filter(e => getYear(parseISO(e.date)) === selectedYear);
    
    const data: Record<string, number[]> = {};
    
    categories.forEach(cat => {
      data[cat.id] = new Array(12).fill(0);
    });

    yearExpenses.forEach(expense => {
      if (data[expense.categoryId]) {
        const month = getMonth(parseISO(expense.date));
        data[expense.categoryId][month] += expense.amount;
      }
    });

    return data;
  }, [expenses, categories, selectedYear]);

  const monthTotals = useMemo(() => {
    const totals = new Array(12).fill(0);
    (Object.values(reportData) as number[][]).forEach(catMonths => {
      catMonths.forEach((amount, i) => {
        totals[i] += amount;
      });
    });
    return totals;
  }, [reportData]);

  const grandTotal = monthTotals.reduce((sum, val) => sum + val, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => setSelectedYear(prev => prev - 1)}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-2xl font-bold text-zinc-900">{selectedYear} Annual Report</h3>
          <Button 
            variant="secondary" 
            onClick={() => setSelectedYear(prev => prev + 1)}
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handlePrint} className="bg-zinc-900 hover:bg-zinc-800">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Printable Area */}
      <div id="printable-report" className="space-y-8 print:m-0 print:p-0">
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Annual Expense Report</h1>
              <p className="text-zinc-500">Financial Year: {selectedYear}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-indigo-600">Financial Tracker</p>
              <p className="text-xs text-zinc-400">Generated on {format(new Date(), 'PPP')}</p>
            </div>
          </div>
        </div>

        <Card className="p-0 overflow-x-auto border-none shadow-none sm:shadow-soft sm:border sm:border-zinc-100 print:shadow-none print:border-none">
          <table className="w-full text-left border-collapse min-w-[1000px] print:min-w-full">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 print:bg-transparent">
                <th className="px-4 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider sticky left-0 bg-zinc-50/50 z-10 print:bg-transparent">Category</th>
                {MONTHS.map(month => (
                  <th key={month} className="px-2 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">{month}</th>
                ))}
                <th className="px-4 py-4 text-xs font-bold text-zinc-900 uppercase tracking-wider text-right bg-zinc-50/50 print:bg-transparent">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {categories.map(category => {
                const rowTotal = reportData[category.id].reduce((sum, val) => sum + val, 0);
                if (rowTotal === 0) return null;

                return (
                  <tr key={category.id} className="hover:bg-zinc-50 transition-colors print:hover:bg-transparent">
                    <td className="px-4 py-4 sticky left-0 bg-white z-10 print:bg-transparent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-sm font-medium text-zinc-900">{category.name}</span>
                      </div>
                    </td>
                    {reportData[category.id].map((amount, i) => (
                      <td key={i} className={cn(
                        "px-2 py-4 text-center text-sm",
                        amount > 0 ? "text-zinc-900" : "text-zinc-300"
                      )}>
                        {amount > 0 ? `$${amount.toFixed(0)}` : '-'}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-right text-sm font-bold text-zinc-900 bg-zinc-50/30 print:bg-transparent">
                      ${rowTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-zinc-900 text-white print:bg-zinc-100 print:text-zinc-900">
                <td className="px-4 py-4 font-bold text-sm sticky left-0 bg-zinc-900 print:bg-zinc-100">Monthly Total</td>
                {monthTotals.map((total, i) => (
                  <td key={i} className="px-2 py-4 text-center text-sm font-bold">
                    ${total.toFixed(0)}
                  </td>
                ))}
                <td className="px-4 py-4 text-right text-sm font-black bg-indigo-600 print:bg-zinc-200">
                  ${grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          <Card className="bg-indigo-50 border-indigo-100 print:bg-transparent print:border-zinc-200">
            <h4 className="text-indigo-900 font-bold mb-2 print:text-zinc-900">Annual Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-600 print:text-zinc-500">Average Monthly Spending</span>
                <span className="font-bold text-indigo-900 print:text-zinc-900">${(grandTotal / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-indigo-600 print:text-zinc-500">Highest Spending Month</span>
                <span className="font-bold text-indigo-900 print:text-zinc-900">
                  {MONTHS[monthTotals.indexOf(Math.max(...monthTotals))]} (${Math.max(...monthTotals).toLocaleString()})
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-emerald-50 border-emerald-100 print:bg-transparent print:border-zinc-200">
            <h4 className="text-emerald-900 font-bold mb-2 print:text-zinc-900">Top Category</h4>
            {(() => {
              const categoryTotals = categories.map(cat => ({
                name: cat.name,
                total: reportData[cat.id].reduce((sum, val) => sum + val, 0)
              })).sort((a, b) => b.total - a.total);
              
              const top = categoryTotals[0];
              
              return top && top.total > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 print:text-zinc-500">Most Expensive Category</span>
                    <span className="font-bold text-emerald-900 print:text-zinc-900">{top.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 print:text-zinc-500">Percentage of Total</span>
                    <span className="font-bold text-emerald-900 print:text-zinc-900">
                      {((top.total / grandTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-emerald-600">No data available</p>
              );
            })()}
          </Card>
        </div>

        <div className="hidden print:block pt-12 border-t border-zinc-100">
          <p className="text-xs text-zinc-400 text-center italic">
            This report is for informational purposes only. Financial Tracker © 2026
          </p>
        </div>
      </div>
    </motion.div>
  );
};
