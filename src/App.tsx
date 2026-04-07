import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart as PieChartIcon, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy
} from 'firebase/firestore';

// Types & Constants
import { Expense, Category, Income, TabType } from './types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from './constants';

// UI Components
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';

// Feature Components
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ExpenseTab } from './components/ExpenseTab';
import { CategoryTab } from './components/CategoryTab';
import { IncomeTab } from './components/IncomeTab';
import { ReportsTab } from './components/ReportsTab';

// Modals
import { ExpenseModal } from './components/modals/ExpenseModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { IncomeModal } from './components/modals/IncomeModal';
import { ConfirmModal } from './components/modals/ConfirmModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  
  // Modals
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form States
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: AVAILABLE_ICONS[0],
    color: AVAILABLE_COLORS[0],
    budget: ''
  });

  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    description: '',
    source: 'Salary',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Data Sync Effect
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setCategories([]);
      setIncomes([]);
      return;
    }

    const qExpenses = query(
      collection(db, 'expenses'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const qCategories = query(
      collection(db, 'categories'),
      where('uid', '==', user.uid)
    );

    const qIncomes = query(
      collection(db, 'incomes'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    });

    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(data);
    });

    const unsubIncomes = onSnapshot(qIncomes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
      setIncomes(data);
    });

    return () => {
      unsubExpenses();
      unsubCategories();
      unsubIncomes();
    };
  }, [user]);

  // Set default category for expense form when categories load
  useEffect(() => {
    if (categories.length > 0 && !expenseForm.categoryId) {
      setExpenseForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  // Expense CRUD
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !expenseForm.amount || !expenseForm.description || !expenseForm.categoryId) return;

    const data = {
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.description,
      date: expenseForm.date,
      categoryId: expenseForm.categoryId,
      uid: user.uid
    };

    try {
      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), data);
      } else {
        await addDoc(collection(db, 'expenses'), data);
      }
      setIsAddExpenseModalOpen(false);
      setEditingExpense(null);
      setExpenseForm({
        amount: '',
        description: '',
        categoryId: categories[0]?.id || '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error("Error saving expense", error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'expenses', id));
        } catch (error) {
          console.error("Error deleting expense", error);
        }
      }
    });
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount.toString(),
      description: expense.description,
      categoryId: expense.categoryId,
      date: expense.date
    });
    setIsAddExpenseModalOpen(true);
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryForm.name) return;

    const data = {
      name: categoryForm.name,
      icon: categoryForm.icon,
      color: categoryForm.color,
      budget: categoryForm.budget ? parseFloat(categoryForm.budget) : 0,
      uid: user.uid
    };

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), data);
      } else {
        await addDoc(collection(db, 'categories'), data);
      }
      setIsAddCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        icon: AVAILABLE_ICONS[0],
        color: AVAILABLE_COLORS[0],
        budget: ''
      });
    } catch (error) {
      console.error("Error saving category", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const hasExpenses = expenses.some(e => e.categoryId === id);
    if (hasExpenses) {
      setConfirmModal({
        isOpen: true,
        title: 'Cannot Delete Category',
        message: 'Cannot delete category that has expenses. Please reassign or delete the expenses first.',
        onConfirm: () => {},
        variant: 'warning'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'categories', id));
        } catch (error) {
          console.error("Error deleting category", error);
        }
      }
    });
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
      budget: category.budget?.toString() || ''
    });
    setIsAddCategoryModalOpen(true);
  };

  // Income CRUD
  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !incomeForm.amount || !incomeForm.description || !incomeForm.source) return;

    const data = {
      amount: parseFloat(incomeForm.amount),
      description: incomeForm.description,
      date: incomeForm.date,
      source: incomeForm.source,
      uid: user.uid
    };

    try {
      if (editingIncome) {
        await updateDoc(doc(db, 'incomes', editingIncome.id), data);
      } else {
        await addDoc(collection(db, 'incomes'), data);
      }
      setIsAddIncomeModalOpen(false);
      setEditingIncome(null);
      setIncomeForm({
        amount: '',
        description: '',
        source: 'Salary',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error("Error saving income", error);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Income Record',
      message: 'Are you sure you want to delete this income record? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'incomes', id));
        } catch (error) {
          console.error("Error deleting income", error);
        }
      }
    });
  };

  const openEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeForm({
      amount: income.amount.toString(),
      description: income.description,
      source: income.source,
      date: income.date
    });
    setIsAddIncomeModalOpen(true);
  };

  // Calculations
  const currentMonthExpenses = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return expenses.filter(e => isWithinInterval(parseISO(e.date), { start, end }));
  }, [expenses]);

  const currentMonthIncomes = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return incomes.filter(i => isWithinInterval(parseISO(i.date), { start, end }));
  }, [incomes]);

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomeThisMonth = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalBalance = incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const monthlyBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0) || 2500;
  const budgetProgress = (totalSpentThisMonth / monthlyBudget) * 100;

  const categoryData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0),
      color: cat.color
    })).filter(d => d.value > 0);
  }, [expenses, categories]);

  const trendData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const spent = expenses
        .filter(e => isWithinInterval(parseISO(e.date), { start, end }))
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        month: format(date, 'MMM'),
        spent: spent
      };
    });
  }, [expenses]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col lg:flex-row bg-zinc-50 overflow-hidden">
        {/* Left Side: Marketing/Info */}
        <div className="hidden lg:flex flex-1 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full -ml-20 -mb-20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <Wallet className="text-white w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Financial Tracker</h1>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <h2 className="text-5xl font-bold text-white leading-tight mb-6">
                Take control of your <span className="text-indigo-200">financial future</span> today.
              </h2>
              <p className="text-indigo-100 text-xl leading-relaxed mb-12">
                The most intuitive way to track expenses, manage budgets, and visualize your financial growth in real-time.
              </p>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: TrendingUp, title: 'Income Tracking', desc: 'Monitor all your revenue sources in one place.' },
                  { icon: Receipt, title: 'Expense Control', desc: 'Categorize and analyze your spending habits.' },
                  { icon: PieChartIcon, title: 'Budget Planning', desc: 'Set monthly limits and stay on track.' },
                  { icon: LayoutDashboard, title: 'Smart Insights', desc: 'Visual reports to help you save more.' },
                ].map((feature, idx) => (
                  <motion.div 
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
                      <feature.icon className="text-indigo-200 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-indigo-200/70 text-sm leading-snug">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 text-indigo-200/50 text-sm">
            © 2026 Financial Tracker. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Wallet className="text-white w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Financial Tracker</h1>
            </div>

            <Card className="p-8 lg:p-12 border-zinc-200 shadow-xl shadow-zinc-200/50">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Welcome Back</h3>
                <p className="text-zinc-500">Sign in to access your dashboard and manage your finances.</p>
              </div>

              <Button 
                onClick={handleLogin} 
                className="w-full py-4 text-lg flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 shadow-sm transition-all active:scale-[0.98]"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-6 h-6"
                />
                Continue with Google
              </Button>

              <div className="mt-10 pt-10 border-t border-zinc-100">
                <div className="flex items-center gap-4 text-sm text-zinc-400 mb-6">
                  <div className="h-px bg-zinc-100 flex-1" />
                  <span>Trusted by thousands</span>
                  <div className="h-px bg-zinc-100 flex-1" />
                </div>
                <div className="flex justify-center gap-8 opacity-40 grayscale">
                  <div className="font-bold text-xl">FINANCE</div>
                  <div className="font-bold text-xl">SECURE</div>
                  <div className="font-bold text-xl">TRUST</div>
                </div>
              </div>
            </Card>
            
            <p className="text-center mt-8 text-zinc-400 text-sm">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-zinc-50 font-sans overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        handleLogout={handleLogout} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <header className="h-16 lg:h-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-2 lg:gap-4">
            {activeTab === 'income' && (
              <Button onClick={() => { setEditingIncome(null); setIncomeForm({ amount: '', description: '', source: 'Salary', date: format(new Date(), 'yyyy-MM-dd') }); setIsAddIncomeModalOpen(true); }} className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base">
                <Plus className="w-4 h-4 lg:w-5 h-5" />
                <span className="hidden sm:inline">Add Income</span>
              </Button>
            )}
            {activeTab === 'expenses' && (
              <Button onClick={() => { setEditingExpense(null); setExpenseForm({ amount: '', description: '', categoryId: categories[0]?.id || '', date: format(new Date(), 'yyyy-MM-dd') }); setIsAddExpenseModalOpen(true); }} className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base">
                <Plus className="w-4 h-4 lg:w-5 h-5" />
                <span className="hidden sm:inline">Add Expense</span>
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', icon: AVAILABLE_ICONS[0], color: AVAILABLE_COLORS[0], budget: '' }); setIsAddCategoryModalOpen(true); }} className="px-3 lg:px-4 py-1.5 lg:py-2 text-sm lg:text-base">
                <Plus className="w-4 h-4 lg:w-5 h-5" />
                <span className="hidden sm:inline">Add Category</span>
              </Button>
            )}
            <div className="lg:hidden w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
              <img src={user.photoURL || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              expenses={expenses}
              categories={categories}
              totalSpentThisMonth={totalSpentThisMonth}
              totalIncomeThisMonth={totalIncomeThisMonth}
              totalBalance={totalBalance}
              budgetProgress={budgetProgress}
              monthlyBudget={monthlyBudget}
              trendData={trendData}
              categoryData={categoryData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTab 
              expenses={expenses}
              categories={categories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              openEditExpense={openEditExpense}
              handleDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryTab 
              categories={categories}
              expenses={expenses}
              openEditCategory={openEditCategory}
              handleDeleteCategory={handleDeleteCategory}
              setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
              setEditingCategory={setEditingCategory}
              setCategoryForm={setCategoryForm}
            />
          )}

          {activeTab === 'income' && (
            <IncomeTab 
              incomes={incomes}
              openEditIncome={openEditIncome}
              handleDeleteIncome={handleDeleteIncome}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              setActiveTab={setActiveTab} 
              expenses={expenses}
              categories={categories}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex items-center justify-between z-40">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'income', icon: TrendingUp },
          { id: 'expenses', icon: Receipt },
          { id: 'categories', icon: PieChartIcon },
          { id: 'reports', icon: TrendingDown },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={cn(
              "p-2 rounded-xl transition-all",
              activeTab === item.id 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-zinc-400"
            )}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

      <ExpenseModal 
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        editingExpense={editingExpense}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        handleSaveExpense={handleSaveExpense}
        categories={categories}
      />

      <CategoryModal 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        handleSaveCategory={handleSaveCategory}
      />

      <IncomeModal 
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        editingIncome={editingIncome}
        incomeForm={incomeForm}
        setIncomeForm={setIncomeForm}
        handleSaveIncome={handleSaveIncome}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.variant === 'warning' ? 'OK' : 'Delete'}
        cancelText={confirmModal.variant === 'warning' ? '' : 'Cancel'}
      />
    </div>
  );
}
