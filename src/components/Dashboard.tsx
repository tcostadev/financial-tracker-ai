import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Receipt,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Expense, Category, Income, TabType } from '../types';
import { IconMap } from '../constants';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  totalSpentThisMonth: number;
  totalIncomeThisMonth: number;
  totalBalance: number;
  budgetProgress: number;
  monthlyBudget: number;
  trendData: any[];
  categoryData: any[];
  setActiveTab: (tab: TabType) => void;
}

export const Dashboard = ({
  expenses,
  categories,
  totalSpentThisMonth,
  totalIncomeThisMonth,
  totalBalance,
  budgetProgress,
  monthlyBudget,
  trendData,
  categoryData,
  setActiveTab
}: DashboardProps) => {
  const [showBalance, setShowBalance] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [showBudget, setShowBudget] = useState(false);

  const formatValue = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const mask = '••••••';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Dashboard Header */}
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Financial Overview</h2>
        <p className="text-zinc-500">Track your performance and spending habits.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Balance</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Wallet className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-zinc-900">{showBalance ? formatValue(totalBalance) : mask}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>Net Worth</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Monthly Income</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowIncome(!showIncome)}
                className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
              >
                {showIncome ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-zinc-900">{showIncome ? formatValue(totalIncomeThisMonth) : mask}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>Total for {format(new Date(), 'MMMM')}</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Monthly Expenses</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowExpenses(!showExpenses)}
                className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
              >
                {showExpenses ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="p-2 bg-rose-50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-zinc-900">{showExpenses ? formatValue(totalSpentThisMonth) : mask}</h3>
          <div className="mt-4 flex items-center gap-2 text-rose-600 text-sm font-medium">
            <ArrowDownRight className="w-4 h-4" />
            <span>Total for {format(new Date(), 'MMMM')}</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Budget Progress</p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowBudget(!showBudget)}
                className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400 hover:text-zinc-600"
              >
                {showBudget ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <div className="p-2 bg-amber-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-zinc-900">{budgetProgress.toFixed(1)}%</h3>
          <div className="mt-4 space-y-2">
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
                className={cn(
                  "h-full transition-all duration-1000",
                  budgetProgress > 90 ? "bg-red-500" : "bg-indigo-600"
                )}
              />
            </div>
            <p className="text-xs text-zinc-500 text-right">
              {showBudget 
                ? `$${totalSpentThisMonth.toLocaleString()} of $${monthlyBudget.toLocaleString()}` 
                : '•••••• of ••••••'}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[300px] lg:h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Spending Trend</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => showExpenses ? [`$${value.toLocaleString()}`, 'Spent'] : ['••••••', 'Spent']}
                />
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSpent)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col h-auto lg:h-[400px]">
          <h4 className="text-lg font-semibold mb-6">Spending by Category</h4>
          <div className="flex-1 flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/2 h-[200px] sm:h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => showExpenses ? [`$${value.toLocaleString()}`, 'Spent'] : ['••••••', 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-3 sm:pl-6 mt-6 sm:mt-0">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-zinc-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{showExpenses ? `$${item.value.toFixed(0)}` : mask}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold">Recent Transactions</h4>
          <Button variant="ghost" onClick={() => setActiveTab('expenses')}>
            View All
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="divide-y divide-zinc-100">
          {expenses.slice(0, 5).map((expense) => {
            const category = categories.find(c => c.id === expense.categoryId);
            return (
              <div key={expense.id} className="py-4 flex items-center justify-between group hover:bg-zinc-50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category?.color || '#ccc'}20`, color: category?.color || '#ccc' }}
                  >
                    {category ? IconMap[category.icon] : <Receipt className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{expense.description}</p>
                    <p className="text-xs text-zinc-500">{format(parseISO(expense.date), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900">{showExpenses ? `-$${expense.amount.toFixed(2)}` : '••••••'}</p>
                  <p className="text-xs text-zinc-500">{category?.name || 'Uncategorized'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};
